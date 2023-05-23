import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote } from "@prisma/client"
import React from "react"

type Props = { status?: Stakeholdernote["status"] }

export const StakeholderSectionListItemStatus: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <div className="flex w-11 flex-none flex-col items-center justify-start text-blue-200">
          <div className="mb-2 h-10 w-10 rounded-full border-4 border-blue-200" />
          <small className="font-xs whitespace-nowrap text-center leading-tight tracking-tight">
            ausstehend
          </small>
        </div>
      )
    case "IN_PROGRESS":
      return (
        <div className="flex w-11 flex-none flex-col items-center justify-start text-gray-400">
          <div className="mb-2 h-10 w-10 rounded-full bg-gray-400" />
          <small className="font-xs whitespace-nowrap text-center leading-tight tracking-tight">
            in Arbeit
          </small>
        </div>
      )
    case "IRRELEVANT":
      return (
        <div className="flex w-11 flex-none flex-col items-center justify-start text-gray-300">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
            <XMarkIcon className="w-5 text-white" />
          </div>
          <small className="font-xs text-center leading-tight tracking-tight">
            nicht erforderlich
          </small>
        </div>
      )
    case "DONE":
      return (
        <div className="flex w-11 flex-none flex-col items-center justify-start text-blue-600">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
            <CheckIcon className="w-5 text-white" />
          </div>
          <small className="font-xs whitespace-nowrap text-center leading-tight tracking-tight">
            erledigt
          </small>
        </div>
      )
    default:
      return (
        <div className="flex w-11 flex-none flex-col items-center justify-start text-blue-600">
          <div className="mb-2 h-10 w-10 rounded-full bg-blue-600" />
          <small className="font-xs whitespace-nowrap text-center leading-tight tracking-tight">
            erledigt
          </small>
        </div>
      )
  }
}
