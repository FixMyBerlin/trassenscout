import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSurveysInput
  extends Pick<Prisma.SurveyFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSurveysInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: surveys,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.survey.count({ where }),
      query: (paginateArgs) => db.survey.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      surveys,
      nextPage,
      hasMore,
      count,
    }
  },
)
