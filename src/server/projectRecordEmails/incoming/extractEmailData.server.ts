import db from "@/src/server/db.server"
import { parseEmail } from "./parseEmail.server"

export async function extractEmailData({
  projectRecordEmail,
}: {
  projectRecordEmail: NonNullable<Awaited<ReturnType<typeof db.projectRecordEmail.findFirst>>>
}) {
  const needsParsing =
    !projectRecordEmail.textBody || !projectRecordEmail.subject || !projectRecordEmail.from

  if (needsParsing) {
    const parsed = await parseEmail({ rawEmailText: projectRecordEmail.text })

    return {
      body: projectRecordEmail.textBody || parsed.body,
      subject: projectRecordEmail.subject || parsed.subject,
      from: projectRecordEmail.from || parsed.from,
    }
  }

  return {
    body: projectRecordEmail.textBody as string,
    subject: projectRecordEmail.subject,
    from: projectRecordEmail.from,
  }
}
