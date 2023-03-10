import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Stakeholdernote } from "@prisma/client"
import React from "react"

type Props = { status?: Stakeholdernote["status"] }

export const StakeholderStatus: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <div className="w-18 flex-shrink-0 text-center text-gray-400">
          <div className="mx-auto mb-2 h-10  w-10 rounded-full border-4 border-gray-400" />
          <small>ausstehend</small>
          <br />
          <small className="opacity-0">ausstehend</small>
          {/* TODO find a serious solution: prevent div from shrinking so that all have the same size */}
        </div>
      )
    case "IN_PROGRESS":
      return (
        <div className="w-18 flex-shrink-0 text-center text-gray-400">
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gray-400" />
          <small>in Arbeit</small>
          <br />
          <small className="opacity-0">ausstehend</small>
        </div>
      )
    case "IRRELEVANT":
      return (
        <div className="w-18 flex-shrink-0 text-center text-gray-300">
          <div className="mx-auto mb-2 flex  h-10 w-10 rounded-full bg-gray-300">
            <XMarkIcon className="mx-auto w-4 text-white" />
          </div>
          <small>irrelevant</small>
          <br />
          <small className="opacity-0">ausstehend</small>
        </div>
      )
    case "DONE":
      return (
        <div className="w-18 text-sky-600 flex-shrink-0 text-center">
          <div className="bg-sky-600 mx-auto mb-2  flex h-10 w-10 rounded-full">
            <CheckIcon className="mx-auto w-4 text-white" />
          </div>
          <small>erledigt</small>
          <br />
          <small className="opacity-0">ausstehend</small>
        </div>
      )
    default:
      return (
        <div className="w-18 text-sky-600 flex-shrink-0 text-center">
          <div className="bg-sky-600 mx-auto mb-2  h-10 w-10 rounded-full" />
          <small>erledigt</small>
          <br />
          <small className="opacity-0">ausstehend</small>
        </div>
      )
  }
}
