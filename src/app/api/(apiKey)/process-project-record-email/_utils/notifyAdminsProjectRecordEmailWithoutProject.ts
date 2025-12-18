import { projectRecordEmailWithoutProjectNotificationToAdmins } from "@/emails/mailers/projectRecordEmailWithoutProjectNotificationToAdmins"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"

type Props = {
  projectSlug: string | undefined
  senderEmail: string
  emailSubject: string | null
  projectRecordEmailId: number
}

/**
 * Notifies all system admins about an email that could not be assigned to a project.
 * Reasons can include: no project slug provided (direct inbox), or invalid project slug.
 * Sends an email to each user with ADMIN role.
 */
export const notifyAdminsProjectRecordEmailWithoutProject = async ({
  projectSlug,
  senderEmail,
  emailSubject,
  projectRecordEmailId,
}: Props) => {
  // Send notification to admin
  await (
    await projectRecordEmailWithoutProjectNotificationToAdmins({
      projectSlug,
      senderEmail,
      emailSubject,
      // @ts-expect-error bypass the strict type checking for the Route type
      projectRecordEmailUrl: mailUrl(`/admin/project-record-emails/${projectRecordEmailId}/edit`),
    })
  ).send()
}
