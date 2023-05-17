import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { SubsubsectionWithPosition } from "./getSubsubsection"
import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"

type GetSubsubsectionsInput = Pick<
  Prisma.SubsubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

// Currently unused
export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getSubsectionProjectId),
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
