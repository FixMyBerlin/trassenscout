import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote, SurveyResponse } from "@prisma/client"
import React from "react"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"
import { ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { surveyResponseStatus } from "src/survey-responses/components/feedback/surveyResponseStatus"

type Props = {
  status: Stakeholdernote["status"] | SurveyResponse["status"]
}

const statusColors = {
  IRRELEVANT: "text-gray-700 bg-gray-100",
  PENDING: "text-yellow-700 bg-yellow-100",
  IN_PROGRESS: "text-indigo-700 bg-indigo-100",
  ASSIGNED: "text-indigo-700 bg-indigo-100",
  HANDED_OVER: "text-indigo-700 bg-indigo-100",
  DONE: "text-green-700 bg-green-100",
  DONE_FAQ: "text-green-700 bg-green-100",
  DONE_PLANING: "text-green-700 bg-green-100",
}

const statusIcon = {
  IRRELEVANT: <XMarkIcon className="h-4 w-4" />,
  PENDING: <DocumentTextIcon className="h-4 w-4" />,
  IN_PROGRESS: <ClockIcon className="h-4 w-4" />,
  ASSIGNED: <ClockIcon className="h-4 w-4" />,
  HANDED_OVER: <ClockIcon className="h-4 w-4" />,
  DONE: <CheckIcon className="h-4 w-4" />,
  DONE_FAQ: <CheckIcon className="h-4 w-4" />,
  DONE_PLANING: <CheckIcon className="h-4 w-4" />,
}

export const ListItemStatus: React.FC<Props> = ({ status }) => {
  if (!status) return null

  const label =
    // @ts-expect-error
    status in stakeholderNotesStatus ? stakeholderNotesStatus[status] : surveyResponseStatus[status]

  return (
    <div
      className={clsx(
        statusColors[status],
        "w-[200px] px-5 flex gap-4 items-center py-2 rounded-full flex-shrink-0",
      )}
    >
      {statusIcon[status]} <div className="pt-1">{label}</div>
    </div>
  )
}
