"use client"

import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { ProjectRecordEditingState } from "@prisma/client"
import clsx from "clsx"

function PendingEditingIcon({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-current",
        className,
      )}
      aria-hidden
    >
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
        "inline-flex items-center text-sm font-normal",
        isPending ? "text-gray-600" : "text-gray-500",
      )}
    >
      <span>{LABEL[editingState]}</span>
    </span>
  )
}
