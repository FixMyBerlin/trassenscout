import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteDate = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteDate),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const date = await db.date.deleteMany({ where: { id } });

    return date;
  }
);
