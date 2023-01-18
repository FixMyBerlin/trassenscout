import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetStakeholdernotesInput
  extends Pick<
    Prisma.StakeholdernoteFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({
    where,
    orderBy,
    skip = 0,
    take = 100,
  }: GetStakeholdernotesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: stakeholdernotes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.stakeholdernote.count({ where }),
      query: (paginateArgs) =>
        db.stakeholdernote.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      stakeholdernotes,
      nextPage,
      hasMore,
      count,
    };
  }
);
