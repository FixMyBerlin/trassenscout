import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ProjectSchema } from "../schema"

export default resolver.pipe(resolver.zod(ProjectSchema), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const project = await db.project.create({ data: input })

  return project
})
