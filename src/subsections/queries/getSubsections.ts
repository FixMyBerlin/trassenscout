import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSubsectionsInput
  extends Pick<Prisma.SubsectionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSubsectionsInput) => {
    const {
      items: subsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsection.count({ where }),
      query: (paginateArgs) => db.subsection.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      subsections,
      nextPage,
      hasMore,
      count,
    }
  }
)
