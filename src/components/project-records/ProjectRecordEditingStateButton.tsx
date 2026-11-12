import { CheckCircleIcon } from "@heroicons/react/24/outline"
import {
  whiteButtonClassName,
  greenButtonClassName,
} from "@/src/components/core/components/buttons/buttonStyles"
import { PendingEditingIcon } from "@/src/components/project-records/ProjectRecordEditingStateIndicator"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

type Props = {
  editingState: ProjectRecordEditingState
  onToggle: (nextEditingState: ProjectRecordEditingState) => void
  disabled?: boolean
  labels: { complete: string; reopen: string }
}

export const ProjectRecordEditingStateButton = ({
  editingState,
  onToggle,
  disabled,
  labels,
}: Props) => {
  const isCompleted = editingState === ProjectRecordEditingState.COMPLETED

  return (
    <button
      type="button"
      disabled={disabled}
      className={isCompleted ? whiteButtonClassName : greenButtonClassName}
      onClick={() =>
        onToggle(
          isCompleted ? ProjectRecordEditingState.PENDING : ProjectRecordEditingState.COMPLETED,
        )
      }
    >
      {isCompleted ? (
        <PendingEditingIcon className="ml-0" />
      ) : (
        <CheckCircleIcon className="size-5 shrink-0" aria-hidden />
      )}
      {isCompleted ? labels.reopen : labels.complete}
    </button>
  )
}
