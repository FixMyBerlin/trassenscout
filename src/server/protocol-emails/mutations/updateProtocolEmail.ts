import { UpdateProtocolEmailSchema } from "@/src/server/protocol-emails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(UpdateProtocolEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    const record = await db.protocolEmail.update({
      where: { id },
      data,
    })
    // TODO logEntry?
    return record
  },
)
