import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSurveySessionsInput
  extends Pick<
    Prisma.SurveySessionFindManyArgs,
    "where" | "orderBy" | "skip" | "take" | "select"
  > {}

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({ where, orderBy, select, skip = 0, take = 100 }: GetSurveySessionsInput) => {
    const {
      items: surveySessions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.surveySession.count({ where }),
      query: (paginateArgs) =>
        db.surveySession.findMany({ ...paginateArgs, where, orderBy, select }),
    })

    return {
      surveySessions,
      nextPage,
      hasMore,
      count,
    }
  }
)
