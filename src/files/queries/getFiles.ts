import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetFilesInput
  extends Pick<
    Prisma.FileFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetFilesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: files,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.file.count({ where }),
      query: (paginateArgs) =>
        db.file.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      files,
      nextPage,
      hasMore,
      count,
    };
  }
);
