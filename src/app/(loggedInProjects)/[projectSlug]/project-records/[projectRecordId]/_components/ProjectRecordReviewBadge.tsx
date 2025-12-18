import { SparklesIcon } from "@heroicons/react/20/solid"
import { ProjectRecordReviewState } from "@prisma/client"

export const ProjectRecordReviewBadge = ({
  reviewState,
}: {
  reviewState: ProjectRecordReviewState
}) => {
  if (reviewState !== ProjectRecordReviewState.NEEDSREVIEW) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-yellow-100 px-2 py-0.5 font-medium text-gray-700">
      <SparklesIcon className="size-3.5" />
      Bestätigung erforderlich
    </span>
  )
}
