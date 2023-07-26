import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSurveyResponsesInput = { surveySlug: string } & Pick<
  Prisma.SurveyResponseFindManyArgs,
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
  }: GetSurveyResponsesInput) => {
    // TODO at the moment surveyId is NOT the relation field
    // const saveWhere = { survey: { slug: surveySlug }, ...where }
    const {
      items: surveyResponses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      maxTake: 1001,
      count: () => db.surveyResponse.count({ where }),
      query: (paginateArgs) =>
        db.surveyResponse.findMany({
          ...paginateArgs,
          where: { surveyId: 1 }, // TODO at the moment we only want the first part of the survey and we get it by surveyId
          orderBy,
        }),
    })

    const groupedSurveyResponses: Record<string, Record<string, number>> = {}

    if (surveyResponses.length) {
      const responseObjectExample = JSON.parse(surveyResponses[0]!.data) as Record<
        string,
        number | number[]
      >
      Object.keys(responseObjectExample).forEach((responseKey) => {
        let result: Record<number, number> = {}
        surveyResponses.forEach((response) => {
          const responseObject = JSON.parse(response.data) as Record<string, number>

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
      surveyResponses,
      groupedSurveyResponses,
      nextPage,
      hasMore,
      count,
    }
  },
)
