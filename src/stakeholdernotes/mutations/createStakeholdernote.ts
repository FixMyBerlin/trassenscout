import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateStakeholdernote = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateStakeholdernote),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const stakeholdernote = await db.stakeholdernote.create({ data: input });

    return stakeholdernote;
  }
);
