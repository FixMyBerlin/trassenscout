import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { ProjectSchema } from "../schema"

const UpdateProject = ProjectSchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    return await db.project.update({ where: { id }, data })
  }
)
