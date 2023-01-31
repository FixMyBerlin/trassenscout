import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteProject = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteProject), resolver.authorize(), async ({ id }) => {
  const project = await db.project.deleteMany({ where: { id } })

  return project
})
