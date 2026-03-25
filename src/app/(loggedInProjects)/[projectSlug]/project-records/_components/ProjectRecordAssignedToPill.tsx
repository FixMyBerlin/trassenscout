import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { pillShellWithGapClassName } from "@/src/core/utils/pillClassNames"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { UserIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type Props = {
  assignedTo: NonNullable<Awaited<ReturnType<typeof getProjectRecord>>["assignedTo"]>
}

export const ProjectRecordAssignedToPill = ({ assignedTo }: Props) => {
  const name = getFullname(assignedTo)?.trim() || "Unbekannt"
  return (
    <span
      className={clsx(
        pillShellWithGapClassName,
        "border border-gray-200 bg-orange-100 text-orange-600",
      )}
    >
      <UserIcon className="size-3.5 shrink-0" aria-hidden />
      <span>Zugewiesen:</span>
      <span>{name}</span>
    </span>
  )
}
