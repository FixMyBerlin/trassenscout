import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateSubsubsection = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateSubsubsection),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const subsubsection = await db.subsubsection.create({ data: input });

    return subsubsection;
  }
);
