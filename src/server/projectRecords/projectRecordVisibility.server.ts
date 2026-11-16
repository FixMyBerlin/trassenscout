import {
  type MembershipRoleEnum,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/browser"
import { editorRoles } from "@/src/server/authorization/constants"

export function projectRecordOverviewVisibilityWhere(aiEnabled: boolean) {
  const where = {
    reviewState: ProjectRecordReviewState.APPROVED,
  }

  if (aiEnabled) return where

  return {
    ...where,
    projectRecordAuthorType: { not: ProjectRecordType.SYSTEM },
  }
}

export const projectRecordTaskWhere = {
  assignedToId: { not: null },
  reviewState: ProjectRecordReviewState.APPROVED,
  NOT: {
    projectRecordAuthorType: ProjectRecordType.SYSTEM,
    project: { aiEnabled: false },
  },
}

export function projectRecordDetailVisibilityWhere(aiEnabled: boolean, canEdit: boolean) {
  return {
    OR: [
      projectRecordOverviewVisibilityWhere(aiEnabled),
      ...(canEdit && aiEnabled ? [{ reviewState: ProjectRecordReviewState.NEEDSREVIEW }] : []),
    ],
  }
}

/**
 * Visibility for Protokoll lists: only entries the detail page opens for this user.
 * `membershipRole` is null for global admins, who may edit everywhere.
 */
export function projectRecordListVisibilityWhere(
  aiEnabled: boolean,
  membershipRole: MembershipRoleEnum | null,
) {
  const canEdit = membershipRole === null || editorRoles.includes(membershipRole)
  return projectRecordDetailVisibilityWhere(aiEnabled, canEdit)
}
