import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { Stakeholdernote } from "@prisma/client"
import { clsx } from "clsx"
import { stakeholderNotesStatus } from "./stakeholdernotesStatus"

type Props = {
  status: Stakeholdernote["status"]
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

const statusIcon: Record<string, "XMARK" | "CLOCK" | "CHECKMARK" | "DOCUMENT"> = {
  IRRELEVANT: "XMARK",
  PENDING: "DOCUMENT",
  IN_PROGRESS: "CLOCK",
  ASSIGNED: "CLOCK",
  HANDED_OVER: "CLOCK",
  DONE: "CHECKMARK",
  DONE_FAQ: "CHECKMARK",
  DONE_PLANING: "CHECKMARK",
}

export const StakeholderSectionListItemStatus: React.FC<Props> = ({ status }) => {
  if (!status) return null

  return (
    <StatusLabel
      icon={statusIcon[status]}
      label={stakeholderNotesStatus[status]}
      className={clsx(statusColors[status], "min-w-[200px]")}
    />
  )
}
