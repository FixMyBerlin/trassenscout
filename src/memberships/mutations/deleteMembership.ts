import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const DeleteMembership = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteMembership),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    return await db.membership.deleteMany({ where: { id } })
  },
)
