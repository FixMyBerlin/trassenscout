import { pillShellWithGapClasses } from "@/src/core/utils/pillClassNames"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { ProjectRecordReviewState } from "@prisma/client"
import clsx from "clsx"

export const ProjectRecordReviewBadge = ({
  reviewState,
}: {
  reviewState: ProjectRecordReviewState
}) => {
  if (reviewState !== ProjectRecordReviewState.NEEDSREVIEW) {
    return null
  }

  return (
    <span
      className={clsx(
        pillShellWithGapClasses,
        "border border-gray-200 bg-yellow-100 text-gray-700",
      )}
    >
      <SparklesIcon className="size-3.5" />
      Bestätigung erforderlich
    </span>
  )
}
