import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { twMerge } from "tailwind-merge"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { projectRecordEditingStateLabel } from "@/src/shared/projectRecords/projectRecordEditingStateLabel"

export function PendingEditingIcon({ className }: { className?: string }) {
  return (
    <span
      className={twMerge(
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

  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-700">
      {editingState === ProjectRecordEditingState.PENDING ? (
        <PendingEditingIcon className="mx-0.5 size-4 border-[1.5px] text-gray-600" />
      ) : (
        <CheckCircleIcon className="size-5 shrink-0 text-gray-600" aria-hidden />
      )}
      <span>{projectRecordEditingStateLabel[editingState]}</span>
    </span>
  )
}
