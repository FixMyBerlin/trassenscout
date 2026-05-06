"use client"

import { pillShellWithGapClasses } from "@/src/core/utils/pillClassNames"
import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { ProjectRecordEditingState } from "@prisma/client"
import clsx from "clsx"

function PendingEditingIcon({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "relative m-0.5 inline-flex size-4 shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full border-2 border-current" />
      <span className="size-1 rounded-full bg-current" />
    </span>
  )
}

const LABEL: Record<ProjectRecordEditingState, string> = {
  [ProjectRecordEditingState.PENDING]: "In Bearbeitung",
  [ProjectRecordEditingState.COMPLETED]: "Abgeschlossen",
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
          aria-label={LABEL[editingState]}
          title={LABEL[editingState]}
        />
      )
    }
    return (
      <span className="inline-flex" title={LABEL[editingState]} aria-label={LABEL[editingState]}>
        <PendingEditingIcon className="text-blue-600" />
      </span>
    )
  }

  const isPending = editingState === ProjectRecordEditingState.PENDING
  return (
    <span
      className={clsx(
        pillShellWithGapClasses,
        "text-xs",
        isPending ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400",
      )}
    >
      {isPending ? (
        <PendingEditingIcon />
      ) : (
        <CheckCircleIcon className="size-4 shrink-0 text-gray-400" />
      )}
      <span>{LABEL[editingState]}</span>
    </span>
  )
}
