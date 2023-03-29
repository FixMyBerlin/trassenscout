import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSurveySessionsInput
  extends Pick<Prisma.SurveySessionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSurveySessionsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: surveySessions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveySession.count({ where }),
      query: (paginateArgs) => db.surveySession.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      surveySessions,
      nextPage,
      hasMore,
      count,
    }
  }
)
