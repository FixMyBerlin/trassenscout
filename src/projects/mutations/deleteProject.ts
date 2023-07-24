import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const DeleteProject = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteProject),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    return await db.project.deleteMany({ where: { id } })
  },
)
