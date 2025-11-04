import { SparklesIcon } from "@heroicons/react/20/solid"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"

export const ProjectRecordReviewBadge = ({
  authorType,
  reviewState,
}: {
  authorType: ProjectRecordType
  reviewState: ProjectRecordReviewState
}) => {
  if (authorType !== ProjectRecordType.SYSTEM) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 font-medium text-gray-500">
      <SparklesIcon className="h-3.5 w-3.5" />
      {reviewState === ProjectRecordReviewState.NEEDSREVIEW
        ? "Freigabe erforderlich"
        : "Freigegeben"}
    </span>
  )
}
