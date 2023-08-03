import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSurveySessionsWithResponsesInput = { projectSlug: string; surveyId: number } & Pick<
  Prisma.SurveySessionFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
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

    // Reminder: `response.surveyId` is NOT a relation field
    // the field here just represents first or second part of the survey json

    // src/participation/data/survey.json
    const surveyResponsesFirstPart = surveySessions
      .map((session) => session.responses)
      .flat()
      .filter((response) => response.surveyId === 1)

    // src/participation/data/feedback.json
    const surveyResponsesFeedbackPart = surveySessions
      .map((session) => session.responses)
      .flat()
      .filter((response) => response.surveyId === 2)

    const groupedSurveyResponsesFirstPart: Record<string, Record<string, number>> = {}

    const responseTemplateData = surveyResponsesFirstPart[0]?.data
    const responseTemplate = responseTemplateData && JSON.parse(responseTemplateData)

    if (responseTemplate && surveyResponsesFirstPart.length) {
      Object.keys(responseTemplate).forEach((responseKey) => {
        let result: Record<number, number> = {}
        surveyResponsesFirstPart.forEach((response) => {
          const responseObject = JSON.parse(response.data) as Record<string, number>

          if (typeof responseObject[responseKey] === "number") {
            // @ts-expect-errors
            result[responseObject[responseKey]] ||= 0
            // @ts-expect-errors
            result[responseObject[responseKey]] += 1
          } else {
            // @ts-expect-errors
            responseObject[responseKey].forEach((responseKeyItem: number) => {
              result[responseKeyItem] ||= 0
              result[responseKeyItem] += 1
            })
          }
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
