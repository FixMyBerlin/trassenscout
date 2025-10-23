import { DeleteProtocolEmailSchema } from "@/src/server/protocol-emails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteProtocolEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const record = await db.protocolEmail.deleteMany({ where: { id } })
    // TODO logEntry?
    return record
  },
)
