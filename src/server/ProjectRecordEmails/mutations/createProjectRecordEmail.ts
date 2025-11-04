import { ProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(ProjectRecordEmailSchema),
  // TODO System and auth ?
  resolver.authorize("ADMIN"),
  async ({ ...data }) => {
    const record = await db.projectRecordEmail.create({
      data,
    })

    // TODO logEntry?

    return record
  },
)
