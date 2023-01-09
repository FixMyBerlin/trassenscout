import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteContactSchema = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteContactSchema),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const contact = await db.contact.deleteMany({ where: { id } });

    return contact;
  }
);
