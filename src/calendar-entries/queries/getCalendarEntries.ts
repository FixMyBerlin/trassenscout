import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetCalendarEntriesInput = { projectSlug: string } & Pick<
  Prisma.CalendarEntryFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { startAt: "asc" },
    skip = 0,
    take = 100,
  }: GetCalendarEntriesInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: calendarEntries,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.calendarEntry.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.calendarEntry.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    return {
      calendarEntries,
      nextPage,
      hasMore,
      count,
    }
  },
)
