import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

type GetTopicsInput = {} & Pick<Prisma.TopicFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default resolver.pipe(
  // @ts-ignore
  async ({ projectSlug, where, orderBy = { id: "asc" }, skip = 0, take = 100 }: GetTopicsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: topics,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.topic.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.topic.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
        }),
    })

    return {
      topics,
      nextPage,
      hasMore,
      count,
    }
  },
)
