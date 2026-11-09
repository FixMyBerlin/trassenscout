import { projectRecordEmailReceivedNotificationToProjectLead } from "@/emails/mailers/projectRecordEmailReceivedNotificationToProjectLead"
import { mailUrl } from "@/emails/mailers/utils/mailUrl"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { findProjectLead } from "@/src/server/projects/findProjectLead.server"
import { projectRecordInboxEmailPath } from "@/src/shared/projectRecordEmails/projectRecordInboxEmailPath"

type Props = {
  project: { id: number; slug: string; aiEnabled: boolean }
  projectRecordEmailId: number
}

export async function notifyProjectLeadProjectRecordEmailReceived({
  project,
  projectRecordEmailId,
}: Props) {
  if (!project.aiEnabled) return

  try {
    const projectLead = await findProjectLead(project.id)
    if (!projectLead) return

    await (
      await projectRecordEmailReceivedNotificationToProjectLead({
        projectLeadEmail: projectLead.email,
        projectName: shortTitle(project.slug),
        inboxEmailUrl: mailUrl(projectRecordInboxEmailPath(project.slug, projectRecordEmailId)),
      })
    ).send()
  } catch (error) {
    console.error("Failed to notify the Projektleitung about a new Posteingang mail:", error)
  }
}
