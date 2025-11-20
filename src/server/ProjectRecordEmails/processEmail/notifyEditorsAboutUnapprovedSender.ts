import db from "@/db"
import { unapprovedSenderNotificationToAdmins } from "@/emails/mailers/unapprovedSenderNotificationToAdmins"

type Props = {
  projectId: number
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordId: number
}

/**
 * Notifies all system admins about an email received from an unapproved sender.
 * Sends an email to each user with ADMIN role.
 */
export const notifyAdminsAboutUnapprovedSender = async ({
  projectId,
  senderEmail,
  emailSubject,
  projectRecordId,
}: Props) => {
  // Fetch project details for the email
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })

  if (!project) {
    return
  }

  // Send notification to admin
  await (
    await unapprovedSenderNotificationToAdmins({
      projectSlug: project.slug,
      senderEmail,
      emailSubject,
      projectRecordReviewUrl: `admin/project-records/${projectRecordId}/review`,
    })
  ).send()
}
