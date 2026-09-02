import { twJoin } from "tailwind-merge"
import { getFullname } from "@/src/components/core/users/getFullname"
import { pillShellWithGapClasses } from "@/src/components/core/utils/pillClassNames"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

type Props = {
  assignedTo: NonNullable<ProjectRecord["assignedTo"]>
  variant: "detail" | "list"
  isInteractive?: boolean
  onAssigneeClick?: (assigneeSearchText: string) => void
}

const assignedToPillShortLabel = (user: Props["assignedTo"]) => {
  if (!("id" in user)) {
    return getFullname(user)?.trim() ?? ""
  }
  const firstInitial = (user.firstName ?? "").trim().charAt(0).toLocaleUpperCase()
  const lastName = (user.lastName ?? "").trim()
  return lastName ? `${firstInitial}.${lastName}` : firstInitial
}

export const ProjectRecordAssignedToPill = ({
  assignedTo,
  variant,
  isInteractive = false,
  onAssigneeClick,
}: Props) => {
  const fullName = getFullname(assignedTo)!.trim()
  const displayLabel = variant === "list" ? assignedToPillShortLabel(assignedTo) : fullName
  const filterSearchText = fullName

  const className = twJoin(
    pillShellWithGapClasses,
    "max-w-full min-w-0 bg-orange-100 text-xs whitespace-nowrap text-orange-600",
    variant === "list" && "overflow-hidden",
    isInteractive &&
      "cursor-pointer hover:bg-orange-200/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500/40",
  )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onAssigneeClick?.(filterSearchText)
  }

  const content = <span className="truncate">{displayLabel}</span>

  if (isInteractive) {
    return (
      <button type="button" className={className} onClick={handleClick}>
        {content}
      </button>
    )
  }

  return <span className={className}>{content}</span>
}
