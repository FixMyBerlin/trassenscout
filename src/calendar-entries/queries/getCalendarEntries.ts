import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetCalendarEntriesInput
  extends Pick<
    Prisma.CalendarEntryFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCalendarEntriesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: calendarEntries,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.calendarEntry.count({ where }),
      query: (paginateArgs) =>
        db.calendarEntry.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      calendarEntries,
      nextPage,
      hasMore,
      count,
    };
  }
);
