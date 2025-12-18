import db from "@/db"
import { projectRecordNeedsReviewNotificationToAdmins } from "@/emails/mailers/projectRecordNeedsReviewNotificationToAdmins"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"

type Props = {
  projectId: number
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordId: number
  isAiEnabled: boolean
  isSenderApproved: boolean
}

/**
 * Notifies all system admins about an email that requires manual review.
 * Reasons can include: unapproved sender, disabled AI features, or both.
 * Sends an email to each user with ADMIN role.
 */
export const notifyAdminsProjectRecordNeedsReview = async ({
  projectId,
  senderEmail,
  emailSubject,
  projectRecordId,
  isAiEnabled,
  isSenderApproved,
}: Props) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })

  if (!project) {
    return
  }

  // Send notification to admin
  await (
    await projectRecordNeedsReviewNotificationToAdmins({
      projectSlug: project.slug,
      senderEmail,
      emailSubject,
      // @ts-expect-error bypass the strict type checking for the Route type
      projectRecordReviewUrl: mailUrl(`/admin/project-records/${projectRecordId}/edit`),
      isAiEnabled,
      isSenderApproved,
    })
  ).send()
}
