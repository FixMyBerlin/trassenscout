import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote } from "@prisma/client"
import React from "react"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"
import { ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

type Props = { status: Stakeholdernote["status"] }

const statusColors = {
  IRRELEVANT: "text-gray-700 bg-gray-100",
  PENDING: "text-yellow-700 bg-yellow-100",
  IN_PROGRESS: "text-indigo-700 bg-indigo-100",
  DONE: "text-green-700 bg-green-100",
}

const statusIcon = {
  IRRELEVANT: <XMarkIcon className="h-6 w-6" />,
  PENDING: <DocumentTextIcon className="h-6 w-6" />,
  IN_PROGRESS: <ClockIcon className="h-6 w-6" />,
  DONE: <CheckIcon className="h-6 w-6" />,
}

export const StakeholderSectionListItemStatus: React.FC<Props> = ({ status }) => {
  const label = stakeholderNotesStatus[status]

  return (
    <div
      className={clsx(
        statusColors[status],
        "flex w-full items-center justify-between gap-2 rounded-full px-5 py-1 font-bold"
      )}
    >
      {statusIcon[status]} <div className="grow text-center">{label}</div>
    </div>
  )
}
