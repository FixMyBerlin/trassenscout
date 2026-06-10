import { Suspense } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectRecordsNeedsReviewContent } from "@/src/components/project-records/ProjectRecordsNeedsReviewContent"

export function PageProjectRecordsNeedReview() {
  return (
    <Suspense fallback={<Spinner page />}>
      <ProjectRecordsNeedsReviewContent />
    </Suspense>
  )
}
