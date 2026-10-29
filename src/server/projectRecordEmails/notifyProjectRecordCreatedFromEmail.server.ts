import { projectRecordCreatedNotificationToProjectLead } from "@/emails/mailers/projectRecordCreatedNotificationToProjectLead"
import { projectRecordCreatedNotificationToSender } from "@/emails/mailers/projectRecordCreatedNotificationToSender"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { findProjectLead } from "@/src/server/projects/findProjectLead.server"
import { projectRecordDetailPath } from "@/src/shared/projectRecords/projectRecordDetailPath"
import { findAdminOrProjectMember } from "./incoming/checkSenderApproval.server"

type Props = {
  projectId: number
  projectSlug: string
  projectRecord: { id: number; title: string; assignedToId: number | null }
  emailFrom: string | null
  actorUserId: number
}

// The entry is already saved, so failures are only logged.
export async function notifyProjectRecordCreatedFromEmail({
  projectId,
  projectSlug,
  projectRecord,
  emailFrom,
  actorUserId,
}: Props) {
  try {
    const [projectLead, sender] = await Promise.all([
      findProjectLead(projectId),
      findAdminOrProjectMember({ projectId, email: emailFrom }),
    ])
    const projectName = shortTitle(projectSlug)
    // The admin who saved the entry and its assignee already know about it.
    const informedUserIds = new Set([actorUserId, projectRecord.assignedToId])

    const mails: (() => Promise<{ send: () => Promise<void> }>)[] = []
    if (projectLead && !informedUserIds.has(projectLead.id)) {
      mails.push(() =>
        projectRecordCreatedNotificationToProjectLead({
          projectLeadEmail: projectLead.email,
          projectName,
          recordTitle: projectRecord.title,
          recordPath: projectRecordDetailPath(projectSlug, projectRecord.id),
        }),
      )
    }
    // Only senders Trassenscout knows get a confirmation; a Projektleitung got the mail above.
    if (sender && !informedUserIds.has(sender.id) && sender.id !== projectLead?.id) {
      mails.push(() =>
        projectRecordCreatedNotificationToSender({ senderEmail: sender.email, projectName }),
      )
    }

    const results = await Promise.allSettled(mails.map(async (mail) => (await mail()).send()))
    for (const result of results) {
      if (result.status === "rejected") {
        console.error(
          "Failed to send a notice for an entry saved from the Posteingang:",
          result.reason,
        )
      }
    }
  } catch (error) {
    console.error("Failed to send the notices for an entry saved from the Posteingang:", error)
  }
}
