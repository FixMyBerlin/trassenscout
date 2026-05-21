import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { DeleteProjectRecordTemplateSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordTemplateSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    return await db.projectRecordTemplate.deleteMany({ where: { id } })
  },
)
