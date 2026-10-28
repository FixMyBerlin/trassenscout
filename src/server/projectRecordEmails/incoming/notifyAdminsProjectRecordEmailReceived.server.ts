import { projectRecordEmailReceivedNotificationToAdmins } from "@/emails/mailers/projectRecordEmailReceivedNotificationToAdmins"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"

type Props = {
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordEmailId: number
}

export async function notifyAdminsProjectRecordEmailReceived({
  projectSlug,
  senderEmail,
  emailSubject,
  projectRecordEmailId,
}: Props) {
  // The mail is already stored; a failed notice must not send it to the listener's ERROR folder.
  try {
    await (
      await projectRecordEmailReceivedNotificationToAdmins({
        projectSlug,
        senderEmail,
        emailSubject,
        inboxEmailUrl: mailUrl(`/${projectSlug}/project-records/inbox/${projectRecordEmailId}`),
      })
    ).send()
  } catch (error) {
    console.error("Failed to notify admins about a new Posteingang mail:", error)
  }
}
