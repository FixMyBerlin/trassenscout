import { ProtocolEmailSchema } from "@/src/server/protocol-emails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(ProtocolEmailSchema),
  // TODO System and auth ?
  resolver.authorize("ADMIN"),
  async ({ ...data }) => {
    const record = await db.protocolEmail.create({
      data,
    })

    // TODO logEntry?

    return record
  },
)
