import { projectRecordCreatedNotificationToProjectLead } from "@/emails/mailers/projectRecordCreatedNotificationToProjectLead"
import { projectRecordCreatedNotificationToSender } from "@/emails/mailers/projectRecordCreatedNotificationToSender"
import { projectRecordPendingNotificationToSender } from "@/emails/mailers/projectRecordPendingNotificationToSender"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { findProjectLead } from "@/src/server/projects/findProjectLead.server"
import { projectRecordDetailPath } from "@/src/shared/projectRecords/projectRecordDetailPath"
import { findAdminOrProjectMember } from "./incoming/checkSenderApproval.server"

type ProjectLead = { id: number; email: string }

type Props = {
  projectId: number
  projectSlug: string
  projectRecord: {
    id: number
    title: string
    assignedToId: number | null
    reviewState: ProjectRecordReviewState
  }
  projectLead: ProjectLead | null
  emailFrom: string | null
  actorUserId: number
}

async function findSenderToNotify(
  projectId: number,
  emailFrom: string | null,
  informedUserIds: (number | null | undefined)[],
) {
  const sender = await findAdminOrProjectMember({ projectId, email: emailFrom })
  return sender && !informedUserIds.includes(sender.id) ? sender : null
}

// The entry is already saved, so failures are only logged.
export async function notifyProjectRecordCreatedFromEmail({
  projectId,
  projectSlug,
  projectRecord,
  projectLead,
  emailFrom,
  actorUserId,
}: Props) {
  try {
    const projectName = shortTitle(projectSlug)
    const needsConfirmation = projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
    // The admin who saved it and its assignee know already; a Projektleitung gets their own mail.
    const sender = await findSenderToNotify(projectId, emailFrom, [
      actorUserId,
      projectRecord.assignedToId,
      projectLead?.id,
    ])

    const mails: (() => Promise<{ send: () => Promise<void> }>)[] = []
    if (needsConfirmation && projectLead) {
      mails.push(() =>
        projectRecordCreatedNotificationToProjectLead({
          projectLeadEmail: projectLead.email,
          projectName,
          recordTitle: projectRecord.title,
          recordPath: projectRecordDetailPath(projectSlug, projectRecord.id),
        }),
      )
    }
    if (sender) {
      const senderMail = needsConfirmation
        ? projectRecordPendingNotificationToSender
        : projectRecordCreatedNotificationToSender
      mails.push(() => senderMail({ senderEmail: sender.email, projectName }))
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

type ConfirmedProps = {
  projectId: number
  projectSlug: string
  projectRecord: {
    userId: number | null
    assignedToId: number | null
    projectRecordEmail: { from: string | null } | null
  }
  actorUserId: number
}

// Confirming an admin's Posteingang entry sends its sender the usual confirmation.
export async function notifyProjectRecordFromEmailConfirmed({
  projectId,
  projectSlug,
  projectRecord,
  actorUserId,
}: ConfirmedProps) {
  if (!projectRecord.projectRecordEmail || projectRecord.userId === null) return

  try {
    const projectLead = await findProjectLead(projectId)
    const sender = await findSenderToNotify(projectId, projectRecord.projectRecordEmail.from, [
      actorUserId,
      projectRecord.userId,
      projectRecord.assignedToId,
      projectLead?.id,
    ])
    if (!sender) return

    await (
      await projectRecordCreatedNotificationToSender({
        senderEmail: sender.email,
        projectName: shortTitle(projectSlug),
      })
    ).send()
  } catch (error) {
    console.error("Failed to send the confirmation for an entry from the Posteingang:", error)
  }
}
