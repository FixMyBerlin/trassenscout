import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetLogEntriesInput = Pick<Prisma.LogEntryFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({ where, orderBy = { id: "desc" }, skip = 0, take = 250 }: GetLogEntriesInput) => {
    const {
      items: logEntries,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.logEntry.count({ where }),
      query: (paginateArgs) =>
        db.logEntry.findMany({
          ...paginateArgs,
          where,
          orderBy,
        }),
    })

    return {
      logEntries,
      nextPage,
      hasMore,
      count,
    }
  },
)
