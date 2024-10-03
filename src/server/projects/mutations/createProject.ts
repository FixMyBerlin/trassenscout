import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { ProjectSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(ProjectSchema),
  resolver.authorize("ADMIN"),
  async (data) => {
    return await db.project.create({ data })
  },
)
