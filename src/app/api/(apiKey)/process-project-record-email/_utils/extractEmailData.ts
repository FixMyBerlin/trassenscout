import db from "@/db"
import { parseEmail } from "./parseEmail"

// todo type
export const extractEmailData = async ({
  projectRecordEmail,
}: {
  projectRecordEmail: NonNullable<Awaited<ReturnType<typeof db.projectRecordEmail.findFirst>>>
}) => {
  // Check if we need to parse the email
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
    // we check that it exists above
    body: projectRecordEmail.textBody as string,
    subject: projectRecordEmail.subject,
    from: projectRecordEmail.from,
  }
}
