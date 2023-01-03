import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetDatesInput
  extends Pick<
    Prisma.DateFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetDatesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: dates,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.date.count({ where }),
      query: (paginateArgs) =>
        db.date.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      dates,
      nextPage,
      hasMore,
      count,
    };
  }
);
