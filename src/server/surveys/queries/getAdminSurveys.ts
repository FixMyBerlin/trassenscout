import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSurveysInput = Pick<Prisma.SurveyFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({ where, orderBy = { id: "asc" }, skip = 0, take = 100 }: GetSurveysInput) => {
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
