import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number } & Pick<
  Prisma.SurveySessionFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
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
          include: { responses: true },
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

    // the first item of the array is the oldest response
    // this is important as we need to get the original questions (including the deleted questions in case we delete questions while survey is active see frm7/data/survey.ts)
    const responseTemplateData = surveyResponsesFirstPart[0]?.data
    const responseTemplate = responseTemplateData && JSON.parse(responseTemplateData)

    if (responseTemplate && surveyResponsesFirstPart.length) {
      Object.keys(responseTemplate).forEach((responseKey) => {
        const result: Record<number, number> = {}
        surveyResponsesFirstPart.forEach((response) => {
          const responseObject = JSON.parse(response.data) as Record<string, number>

          if (typeof responseObject[responseKey] === "number") {
            // @ts-expect-errors
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
