import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { SubsubsectionWithPosition } from "./getSubsubsection"

type GetSubsubsectionsInput = Pick<
  Prisma.SubsubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy = { order: "asc" }, skip = 0, take = 100 }: GetSubsubsectionsInput) => {
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
      subsubsections: subsubsections as SubsubsectionWithPosition[], // Tip: Validate type shape with `satisfies`
      nextPage,
      hasMore,
      count,
    }
  }
)
