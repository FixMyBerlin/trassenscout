import { UpdateProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(UpdateProjectRecordEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    const record = await db.projectRecordEmail.update({
      where: { id },
      data,
    })
    // TODO logEntry?
    return record
  },
)
