import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSurveyResponsesInput
  extends Pick<Prisma.SurveyResponseFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSurveyResponsesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: surveyResponses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveyResponse.count({ where }),
      query: (paginateArgs) => db.surveyResponse.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      surveyResponses,
      nextPage,
      hasMore,
      count,
    }
  }
)
