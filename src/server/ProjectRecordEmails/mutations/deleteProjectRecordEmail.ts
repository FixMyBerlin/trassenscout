import { DeleteProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => {
    const record = await db.projectRecordEmail.deleteMany({ where: { id } })
    // TODO logEntry?
    return record
  },
)
