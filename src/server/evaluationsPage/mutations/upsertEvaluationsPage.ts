import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { EvaluationsPageFormSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(EvaluationsPageFormSchema),
  resolver.authorize("ADMIN"),
  async ({ title, markdown }, ctx) => {
    return await db.evaluationsPage.upsert({
      where: { id: 1 },
      update: {
        title,
        markdown,
        updatedById: ctx.session.userId,
      },
      create: {
        id: 1,
        title,
        markdown,
        updatedById: ctx.session.userId,
      },
    })
  },
)
