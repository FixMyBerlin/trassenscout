import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteStakeholdernote = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteStakeholdernote),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const stakeholdernote = await db.stakeholdernote.deleteMany({
      where: { id },
    });

    return stakeholdernote;
  }
);
