import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteFile = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteFile),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const file = await db.file.deleteMany({ where: { id } });

    return file;
  }
);
