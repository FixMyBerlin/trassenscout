import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateDate = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateDate),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const date = await db.date.update({ where: { id }, data });

    return date;
  }
);
