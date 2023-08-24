import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { surveyResponseStatus } from "./surveyResponseStatus"
import { ClockIcon, DocumentIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

type Props = {
  status: string | null
}

const StatusTagIcon: React.FC<Props> = ({ status }) => {
  switch (status) {
    case "PENDING":
      return <DocumentIcon className="h-4 w-4 mb-1" />
    case "ASSIGNED":
      return <ClockIcon className="h-4 w-4 mb-1" />
    case "HANDED_OVER":
      return <ClockIcon className="h-4 w-4 mb-1" />
    case "IRRELEVANT":
      return <XMarkIcon className="h-4 w-4 mb-1" />
    default:
      return <CheckIcon className="h-4 w-4 mb-1" />
  }
}

export const StatusTag: React.FC<Props> = ({ status }) => {
  if (!status) return
  // @ts-ignore
  const translatedStatus = status ? surveyResponseStatus[status] : ""

  let statusColor = ""
  switch (status) {
    case "PENDING":
      statusColor = "bg-yellow-100 text-yellow-700"
      break
    case "ASSIGNED":
      statusColor = "bg-blue-100 text-blue-700"
      break
    case "HANDED_OVER":
      statusColor = "bg-blue-100 text-blue-600"
      break
    case "IRRELEVANT":
      statusColor = "bg-gray-100 text-gray-700"
      break
    default:
      statusColor = "bg-green-100 text-green-700"
  }

  return (
    <span
      className={clsx(
        statusColor,
        "flex gap-1 items-center pl-3 pr-4 py-2 rounded-full font-semibold",
      )}
    >
      <StatusTagIcon status={status} />
      <p className="">{translatedStatus}</p>
    </span>
  )
}

export default StatusTag
