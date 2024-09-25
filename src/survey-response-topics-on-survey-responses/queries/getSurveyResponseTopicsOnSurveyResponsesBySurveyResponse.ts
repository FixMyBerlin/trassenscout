import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSurveyResponseTopicsOnSurveyResponsesInput = { surveyResponseId: number } & Pick<
  Prisma.SurveyResponseTopicsOnSurveyResponsesFindManyArgs,
  "where" | "skip" | "take" | "include"
>

export default resolver.pipe(
  async ({
    where,
    skip = 0,
    take = 100,
    include,
    surveyResponseId,
  }: GetSurveyResponseTopicsOnSurveyResponsesInput) => {
    const safeWhere = { surveyResponse: { id: surveyResponseId }, ...where }
    const {
      items: surveyResponseTopicsOnSurveyResponses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveyResponseTopicsOnSurveyResponses.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.surveyResponseTopicsOnSurveyResponses.findMany({
          ...paginateArgs,
          where: safeWhere,
          select: { surveyResponseTopicId: true },
        }),
    })

    return {
      surveyResponseTopicsOnSurveyResponses,
      nextPage,
      hasMore,
      count,
    }
  },
)
