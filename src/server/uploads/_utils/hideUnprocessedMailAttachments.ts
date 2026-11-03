import { MembershipRoleEnum, ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { checkProjectAiEnabled } from "@/src/server/projectRecordEmails/incoming/checkProjectAiEnabled.server"
import { isProjectLeadOrAdmin } from "@/src/server/projects/findProjectLead.server"

// Mail attachments show once an entry the user may see uses them; the Posteingang needs all.
export async function hideUnprocessedMailAttachments(input: {
  projectId: number
  userId: number
  membershipRole: MembershipRoleEnum | null
}) {
  if (input.membershipRole === null) return {}
  if ((await isProjectLeadOrAdmin(input)) && (await checkProjectAiEnabled(input.projectId))) {
    return {}
  }

  const visibleStates =
    input.membershipRole === MembershipRoleEnum.EDITOR
      ? [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW]
      : [ProjectRecordReviewState.APPROVED]

  return {
    NOT: {
      projectRecordEmailId: { not: null },
      projectRecords: { none: { reviewState: { in: visibleStates } } },
    },
  }
}
