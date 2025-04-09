import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetLogEntriesInput = Pick<Prisma.LogEntryFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default resolver.pipe(
  // @ts-expect-error
  authorizeProjectMember(extractProjectSlug, editorRoles),
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
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
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
