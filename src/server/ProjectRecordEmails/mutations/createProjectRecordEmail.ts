import { parseEmail } from "@/src/server/ProjectRecordEmails/processEmail/parseEmail"
import { uploadEmailAttachments } from "@/src/server/ProjectRecordEmails/processEmail/uploadEmailAttachments"
import { ProjectRecordEmailSchema } from "@/src/server/ProjectRecordEmails/schema"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(
  resolver.zod(ProjectRecordEmailSchema),
  // TODO System and auth ?
  resolver.authorize("ADMIN"),
  async ({ text, projectId, ...data }) => {
    // Parse email to extract metadata if not already provided
    const parsed = await parseEmail({ rawEmailText: text })

    const record = await db.projectRecordEmail.create({
      data: {
        text,
        projectId,
        textBody: parsed.body,
        from: parsed.from,
        subject: parsed.subject,
        date: parsed.date,
        ...data,
      },
    })

    // Upload attachments to S3 and create Upload records
    const uploadIds = await uploadEmailAttachments({
      attachments: parsed.attachments,
      projectId,
      projectRecordEmailId: record.id,
    })

    // TODO logEntry?

    return record
  },
)
