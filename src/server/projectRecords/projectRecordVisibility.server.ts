import { ProjectRecordReviewState, ProjectRecordType } from "@/src/prisma/generated/browser"

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
