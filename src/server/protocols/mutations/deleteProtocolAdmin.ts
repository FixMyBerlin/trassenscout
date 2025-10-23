import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteProtocolAdminSchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteProtocolAdminSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const protocol = await db.protocol.deleteMany({ where: { id } })
    // TODO: Add admin log entry if needed
    return protocol
  },
)
