import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSubsubsectionsInput
  extends Pick<Prisma.SubsubsectionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSubsubsectionsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: subsubsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsection.count({ where }),
      query: (paginateArgs) => db.subsubsection.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      subsubsections,
      nextPage,
      hasMore,
      count,
    }
  }
)
