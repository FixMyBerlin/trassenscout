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

    // at the moment surveyId (the field in SurveyResponses) is NOT a relation field
    // the field here just represents first or second part of the survey
    // here we first get all responses from the first part of the survey ("SurveyId" : 1)
    const surveyResponsesFirstPart = surveySessions!.map(
      (s) => s.responses.filter((r) => r.surveyId === 1)[0]!,
    )

    // here we first get all responses of type feedback of the survey ("SurveyId" : 2)
    const surveyResponsesFeedbackPartNested = surveySessions!
      .map((s) => s.responses.filter((r) => r.surveyId === 2))
      .filter((array) => array.length > 0)
    //  @ts-ignore
    const surveyResponsesFeedbackPart = [].concat(...surveyResponsesFeedbackPartNested)

    const groupedSurveyResponsesFirstPart: Record<string, Record<string, number>> = {}

    if (surveyResponsesFirstPart.length) {
      const responseObjectExample = JSON.parse(surveyResponsesFirstPart[0]!.data) as Record<
        string,
        number | number[]
      >
      Object.keys(responseObjectExample).forEach((responseKey) => {
        let result: Record<number, number> = {}
        surveyResponsesFirstPart.forEach((response) => {
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
