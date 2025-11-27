import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { parseEmail } from "@/src/server/ProjectRecordEmails/processEmail/parseEmail"
import { ProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

// This mutation creates a ProjectRecordEmail from the admin interface.
// It simulates email processing as much as possible without uploading attachments,
// since projectId is optional. Attachments are parsed and connected later during email processing.

export default resolver.pipe(
  resolver.zod(ProjectRecordEmailSchema),
  resolver.authorize("ADMIN"),
  async ({ text, projectId, ...data }, ctx) => {
    // Parse email to extract metadata if not already provided
    const parsed = await parseEmail({ rawEmailText: text })

    const record = await db.projectRecordEmail.create({
      data: {
        text,
        projectId,
        textBody: parsed.body,
        from: parsed.from,
        subject: parsed.subject,
        date: parsed.date || new Date(),
        ...data,
      },
    })

    // todo update logEntry type
    // Create log entry (only if project exists, since logEntry requires projectId)
    if (projectId) {
      await createLogEntry({
        action: "CREATE",
        message: `Neue Protokoll-E-Mail mit ID ${record.id} aus Admin-UI erstellt ${parsed.from ? ` (Absender*in  ${parsed.from})` : ""}`,
        userId: ctx.session.userId,
        projectId,
      })
    }

    return record
  },
)
