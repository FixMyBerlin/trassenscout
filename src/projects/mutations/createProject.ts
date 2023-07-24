import { resolver } from "@blitzjs/rpc"
import { ProjectSchema } from "../schema"
import db from "db"

export default resolver.pipe(
  resolver.zod(ProjectSchema),
  resolver.authorize("ADMIN"),
  async (input) => {
    return await db.project.create({ data: input })
  },
)
