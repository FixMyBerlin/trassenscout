import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { pillShellWithGapClassName } from "@/src/core/utils/pillClassNames"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import clsx from "clsx"

type Props = {
  assignedTo: NonNullable<Awaited<ReturnType<typeof getProjectRecord>>["assignedTo"]>
  variant: "detail" | "list"
  isInteractive?: boolean
  onAssigneeClick?: (assigneeSearchText: string) => void
}

const assignedToPillShortLabel = (user: Props["assignedTo"]) =>
  `${user.firstName.trim().charAt(0).toLocaleUpperCase()}.${user.lastName.trim()}`

export const ProjectRecordAssignedToPill = ({
  assignedTo,
  variant,
  isInteractive = false,
  onAssigneeClick,
}: Props) => {
  const fullName = getFullname(assignedTo)!.trim()
  const displayLabel = variant === "list" ? assignedToPillShortLabel(assignedTo) : fullName
  const filterSearchText = fullName

  const className = clsx(
    pillShellWithGapClassName,
    "border border-gray-200 bg-orange-100 text-orange-600",
    isInteractive &&
      "cursor-pointer hover:bg-orange-200/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500/40",
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onAssigneeClick?.(filterSearchText)
  }

  const content = <span>{displayLabel}</span>

  if (isInteractive) {
    return (
      <button type="button" className={className} onClick={handleClick}>
        {content}
      </button>
    )
  }

  return <span className={className}>{content}</span>
}
