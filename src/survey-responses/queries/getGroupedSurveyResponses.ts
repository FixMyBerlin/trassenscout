import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSurveySessionsWithResponsesInput = { surveySlug: string } & Pick<
  Prisma.SurveySessionFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({
    surveySlug,
    where,
    orderBy = { id: "desc" },
    skip = 0,
    take = 1000,
  }: GetSurveySessionsWithResponsesInput) => {
    const saveWhere = { survey: { slug: surveySlug }, ...where }
    const {
      items: surveySessions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      maxTake: 1001,
      count: () => db.surveySession.count({ where }),
      query: (paginateArgs) =>
        db.surveySession.findMany({
          ...paginateArgs,
          where: saveWhere,
          orderBy,
          include: {
            // TODO at the moment surveyId (the field in SurveyResponses) is NOT a relation field
            // the field here just represents first or second part of the survey
            // at the moment we only want the first part of the survey
            responses: { where: { surveyId: 1 } },
          },
        }),
    })

    const groupedSurveyResponses: Record<string, Record<string, number>> = {}

    if (surveySessions.length) {
      const responseObjectExample = JSON.parse(surveySessions[0]!.responses[0]!.data) as Record<
        string,
        number | number[]
      >
      Object.keys(responseObjectExample).forEach((responseKey) => {
        let result: Record<number, number> = {}
        surveySessions.forEach((response) => {
          const responseObject = JSON.parse(response.responses[0]!.data) as Record<string, number>

          if (typeof responseObject[responseKey] === "number") {
            // @ts-ignore
            if (responseObject[responseKey] in result) {
              // @ts-ignore
              result[responseObject[responseKey]] += 1
            } else {
              // @ts-ignore
              result[responseObject[responseKey]] = 1
            }
          } else {
            // @ts-ignore
            responseObject[responseKey].forEach((responseKeyItem: number) => {
              if (responseKeyItem in result) {
                result[responseKeyItem] += 1
              } else {
                result[responseKeyItem] = 1
              }
            })
          }
        })

        groupedSurveyResponses[responseKey] = result
      })
    }

    return {
      groupedSurveyResponses,
      surveySessions,
      nextPage,
      hasMore,
      count,
    }
  },
)
