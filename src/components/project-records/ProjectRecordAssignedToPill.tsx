import { twJoin } from "tailwind-merge"
import { getFullname, getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { pillShellWithGapClasses } from "@/src/components/core/utils/pillClassNames"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

type Props = {
  assignedTo: NonNullable<ProjectRecord["assignedTo"]>
  variant: "detail" | "list"
  isInteractive?: boolean
  onAssigneeClick?: (assigneeSearchText: string) => void
}

const appendInstitution = (label: string, user: Props["assignedTo"]) => {
  const institution = user.institution?.trim()
  return label && institution ? `${label} (${institution})` : label
}

const assignedToPillShortLabel = (user: Props["assignedTo"]) => {
  if (!("id" in user)) {
    return getFullnameWithInstitution(user)?.trim() ?? ""
  }
  const firstInitial = (user.firstName ?? "").trim().charAt(0).toLocaleUpperCase()
  const lastName = (user.lastName ?? "").trim()
  const shortName = lastName ? `${firstInitial}.${lastName}` : firstInitial
  return appendInstitution(shortName, user)
}

export const ProjectRecordAssignedToPill = ({
  assignedTo,
  variant,
  isInteractive = false,
  onAssigneeClick,
}: Props) => {
  const fullName = getFullname(assignedTo)?.trim() ?? ""
  const fullLabel = getFullnameWithInstitution(assignedTo)?.trim() ?? fullName
  const displayLabel = variant === "list" ? assignedToPillShortLabel(assignedTo) : fullLabel
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

  const content = (
    <span className="truncate" title={displayLabel || undefined}>
      {displayLabel}
    </span>
  )

  if (isInteractive) {
    return (
      <button type="button" className={className} onClick={handleClick}>
        {content}
      </button>
    )
  }

  return <span className={className}>{content}</span>
}
