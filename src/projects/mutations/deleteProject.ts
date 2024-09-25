import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

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
