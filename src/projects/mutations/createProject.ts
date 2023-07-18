import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ProjectSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(ProjectSchema),
  resolver.authorize("ADMIN"),
  async (input) => {
    return await db.project.create({ data: input })
  },
)
