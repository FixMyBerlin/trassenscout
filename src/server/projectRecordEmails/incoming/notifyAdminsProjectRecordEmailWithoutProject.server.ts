import { projectRecordEmailWithoutProjectNotificationToAdmins } from "@/emails/mailers/projectRecordEmailWithoutProjectNotificationToAdmins"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"

type Props = {
  projectSlug: string | undefined
  senderEmail: string
  emailSubject: string | null
  projectRecordEmailId: number
}

export async function notifyAdminsProjectRecordEmailWithoutProject({
  projectSlug,
  senderEmail,
  emailSubject,
  projectRecordEmailId,
}: Props) {
  await (
    await projectRecordEmailWithoutProjectNotificationToAdmins({
      projectSlug,
      senderEmail,
      emailSubject,
      projectRecordEmailUrl: mailUrl(`/admin/project-record-emails/${projectRecordEmailId}/edit`),
    })
  ).send()
}
