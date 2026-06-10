import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"

export const getProjectRecordEditSuccessNavigateOptions = ({
  projectSlug,
  projectRecordId,
  initialReviewState,
  nextReviewState,
}: {
  projectSlug: string
  projectRecordId: number
  initialReviewState: ProjectRecordReviewState
  nextReviewState: ProjectRecordReviewState
}) => {
  if (nextReviewState === ProjectRecordReviewState.REJECTED) {
    if (initialReviewState === ProjectRecordReviewState.NEEDSREVIEW) {
      return {
        to: "/$projectSlug/project-records/needreview",
        params: { projectSlug },
      }
    }
    return {
      to: "/$projectSlug/project-records",
      params: { projectSlug },
    }
  }

  return {
    to: "/$projectSlug/project-records/$projectRecordId",
    params: { projectSlug, projectRecordId: String(projectRecordId) },
  }
}
