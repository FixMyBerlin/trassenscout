import { projectRecordNeedsReviewNotificationToAdmins } from "@/emails/mailers/projectRecordNeedsReviewNotificationToAdmins"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"
import db from "@/src/server/db.server"

type Props = {
  projectId: number
  projectSlug: string
  senderEmail: string
  emailSubject: string | null
  projectRecordId: number
  isAiEnabled: boolean
  isSenderApproved: boolean
}

export async function notifyAdminsProjectRecordNeedsReview({
  projectId,
  senderEmail,
  emailSubject,
  projectRecordId,
  isAiEnabled,
  isSenderApproved,
}: Props) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })

  if (!project) {
    return
  }

  await (
    await projectRecordNeedsReviewNotificationToAdmins({
      projectSlug: project.slug,
      senderEmail,
      emailSubject,
      projectRecordReviewUrl: mailUrl(`/admin/project-records/${projectRecordId}/edit`),
      isAiEnabled,
      isSenderApproved,
    })
  ).send()
}
