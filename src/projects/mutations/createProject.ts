import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ProjectSchema } from "../schema"

export default resolver.pipe(resolver.zod(ProjectSchema), resolver.authorize(), async (input) => {
  const project = await db.project.create({ data: input })

  return project
})
