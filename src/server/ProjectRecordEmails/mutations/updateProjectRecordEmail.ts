import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { UpdateProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(UpdateProjectRecordEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }, ctx) => {
    const previousRecord = await db.projectRecordEmail.findUnique({ where: { id } })

    const record = await db.projectRecordEmail.update({
      where: { id },
      data,
    })

    // todo update logEntry type
    // Create log entry (only if project exists, since logEntry requires projectId)
    if (record.projectId) {
      await createLogEntry({
        action: "UPDATE",
        message: `Protokoll-E-Mail mit ID ${record.id} aktualisiert`,
        userId: ctx.session.userId,
        projectId: record.projectId,
        previousRecord,
        updatedRecord: record,
      })
    }

    return record
  },
)
