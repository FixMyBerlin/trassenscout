import db, { Prisma } from "@/db"
import { AllowedSurveySlugsSchema } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { getFlatSurveyQuestions } from "@/src/survey-responses/utils/getQuestionsAsArray"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number } & Pick<
  Prisma.SurveySessionFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    surveyId,
    where,
    orderBy = { id: "desc" },
    skip = 0,
    take = 1000,
  }: GetSurveySessionsWithResponsesInput) => {
    const safeWhere = { survey: { project: { slug: projectSlug } }, surveyId, ...where }

    const {
      items: surveySessions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      maxTake: 1001,
      count: () => db.surveySession.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.surveySession.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          include: { responses: true, survey: true },
        }),
    })

    // the surveyPart field here represents first or second part of the survey

    // /data/survey.ts
    const surveyResponsesFirstPart = surveySessions
      .map((session) => session.responses)
      .flat()
      .filter((response) => response.surveyPart === 1)
      // sort: oldest first
      .sort((a, b) => a.id - b.id)

    // /data/feedback.ts
    const surveyResponsesFeedbackPart = surveySessions
      .map((session) => session.responses)
      .flat()
      .filter((response) => response.surveyPart === 2)
      // sort: latest first
      // We need to sort again; the frontend received different orders before…
      .sort((a, b) => b.id - a.id)

    const groupedSurveyResponsesFirstPart: Record<string, Record<string, number>> = {}

    const zod = AllowedSurveySlugsSchema.parse(surveySessions[0]?.survey)

    const responseTemplate = getFlatSurveyQuestions(getConfigBySurveySlug(zod.slug, "part1")).map(
      (question) => question.name,
    )

    if (responseTemplate && surveyResponsesFirstPart.length) {
      responseTemplate.forEach((responseKey) => {
        const result: Record<number, number> = {}
        surveyResponsesFirstPart.forEach((response) => {
          const responseObject = JSON.parse(response.data) as Record<string, number>
          console.log({ responseObject, responseKey })
          if (
            typeof responseObject[responseKey] === "number" ||
            typeof responseObject[responseKey] === "string"
          ) {
            result[responseObject[responseKey]] ||= 0
            // @ts-expect-errors
            result[responseObject[responseKey]] += 1
          }
          if (Array.isArray(responseObject[responseKey])) {
            // @ts-expect-errors
            responseObject[responseKey].forEach((responseKeyItem: number) => {
              result[responseKeyItem] ||= 0
              result[responseKeyItem] += 1
            })
          }
          // To nothing for `null`
        })
        groupedSurveyResponsesFirstPart[responseKey] = result
      })
    }

    return {
      groupedSurveyResponsesFirstPart,
      surveyResponsesFeedbackPart,
      surveySessions,
      nextPage,
      hasMore,
      count,
    }
  },
)
