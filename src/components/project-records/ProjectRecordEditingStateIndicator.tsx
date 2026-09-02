import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { projectRecordEditingStateLabel } from "@/src/shared/projectRecords/projectRecordEditingStateLabel"

function PendingEditingIcon({ className }: { className?: string }) {
  return (
    <span
      className={twJoin(
        "ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-current",
        className,
      )}
      aria-hidden
    >
      <span className="size-1 rounded-full bg-current" />
    </span>
  )
}

type Props = {
  editingState: ProjectRecordEditingState
  variant: "detail" | "table"
}

export const ProjectRecordEditingStateIndicator = ({ editingState, variant }: Props) => {
  if (variant === "table") {
    if (editingState === ProjectRecordEditingState.COMPLETED) {
      return (
        <CheckCircleIcon
          className="size-5 shrink-0 text-gray-400"
          aria-label={projectRecordEditingStateLabel[editingState]}
          title={projectRecordEditingStateLabel[editingState]}
        />
      )
    }
    return (
      <span
        className="inline-flex"
        title={projectRecordEditingStateLabel[editingState]}
        aria-label={projectRecordEditingStateLabel[editingState]}
      >
        <PendingEditingIcon className="text-blue-600" />
      </span>
    )
  }

  const isPending = editingState === ProjectRecordEditingState.PENDING
  return (
    <span
      className={twJoin(
        "inline-flex items-center text-sm font-normal",
        isPending ? "text-gray-600" : "text-gray-500",
      )}
    >
      <span>{projectRecordEditingStateLabel[editingState]}</span>
    </span>
  )
}
