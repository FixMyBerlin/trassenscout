import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateDate = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateDate),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const date = await db.date.create({ data: input });

    return date;
  }
);
