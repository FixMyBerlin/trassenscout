import {
  projectRecordDetailRoute,
  projectRecordsNeedsReviewRoute,
  projectRecordsRoute,
} from "@/src/core/routes/projectRecordRoutes"
import { ProjectRecordReviewState } from "@prisma/client"
import { Route } from "next"

export const getProjectRecordEditSuccessRoute = ({
  projectSlug,
  projectRecordId,
  initialReviewState,
  nextReviewState,
}: {
  projectSlug: string
  projectRecordId: number
  initialReviewState: ProjectRecordReviewState
  nextReviewState: ProjectRecordReviewState
}): Route => {
  if (nextReviewState === ProjectRecordReviewState.REJECTED) {
    if (initialReviewState === ProjectRecordReviewState.NEEDSREVIEW) {
      return projectRecordsNeedsReviewRoute(projectSlug)
    }
    return projectRecordsRoute(projectSlug)
  }

  return projectRecordDetailRoute(projectSlug, projectRecordId)
}
