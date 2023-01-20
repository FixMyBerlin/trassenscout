import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import React from "react"

type Props = { status?: string }

export const StakeholderStatus: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <div className="w-18 flex-shrink-0 text-center text-slate-400">
          <div className="mx-auto mb-2 h-10  w-10 rounded-full border-4 border-slate-400" />
          <small>ausstehend</small>
        </div>
      )
    case "IN-PROGRESS":
      return (
        <div className="w-18 flex-shrink-0 text-center text-slate-400">
          <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-400" />
          <small>in Arbeit</small>
        </div>
      )
    case "IRRELEVANT":
      return (
        <div className="w-18 flex-shrink-0 text-center text-gray-300">
          <div className="mx-auto mb-2 flex  h-10 w-10 rounded-full bg-gray-300">
            <XMarkIcon className="mx-auto w-4 text-white" />
          </div>
          <small>{status}</small>
        </div>
      )
    case "DONE":
      return (
        <div className="w-18 flex-shrink-0 text-center text-sky-600">
          <div className="mx-auto mb-2 flex  h-10 w-10 rounded-full bg-sky-600">
            <CheckIcon className="mx-auto w-4 text-white" />
          </div>
          <small>erledigt</small>
        </div>
      )
    default:
      return (
        <div className="w-18 flex-shrink-0 text-center text-sky-600">
          <div className="mx-auto mb-2 h-10  w-10 rounded-full bg-sky-600" />
          <small>erledigt</small>
        </div>
      )
  }
}
