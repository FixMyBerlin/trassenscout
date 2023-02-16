import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "../../authorization"

type GetCalendarEntriesInput = { projectSlug: string } & Pick<
  Prisma.CalendarEntryFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin,
  async ({ projectSlug, where, orderBy, skip = 0, take = 100 }: GetCalendarEntriesInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: calendarEntries,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.calendarEntry.count({ where: saveWhere }),
      query: (paginateArgs) =>
        db.calendarEntry.findMany({ ...paginateArgs, where: saveWhere, orderBy }),
    })

    return {
      calendarEntries,
      nextPage,
      hasMore,
      count,
    }
  }
)
