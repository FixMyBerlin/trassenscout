import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import { matchesTagFilter } from "@/src/components/tags/tagFilterOptions"
import { useCurrentUser } from "@/src/components/user/useCurrentUser"
import type { ProjectRecordListItem, ProjectRecordsList } from "@/src/server/projectRecords/types"
import {
  PROJECT_RECORD_FILTER_DEFAULTS,
  type ProjectRecordFilter,
} from "@/src/shared/projectRecords/searchSchemas"
import { useProjectRecordFilters } from "../useProjectRecordFilters"

function matchesSearchterm(projectRecord: ProjectRecordListItem, searchterm: string) {
  const cleanedSearchterm = normalizeSearchterm(searchterm)
  if (!cleanedSearchterm) return true

  const assigneeName = projectRecord.assignedTo
    ? (getFullnameWithInstitution(projectRecord.assignedTo)?.trim().toLowerCase() ?? "")
    : ""

  return (
    projectRecord.title?.toLowerCase().includes(cleanedSearchterm) ||
    projectRecord.body?.toLowerCase().includes(cleanedSearchterm) ||
    assigneeName.includes(cleanedSearchterm)
  )
}

function matchesDirection(
  projectRecord: ProjectRecordListItem,
  direction: ProjectRecordFilter["direction"],
  userId: number | undefined,
) {
  if (direction === "all" || userId == null) return true
  if (direction === "toMe") return projectRecord.assignedToId === userId
  if (direction === "createdByMe") return projectRecord.userId === userId
  return projectRecord.assignedById === userId
}

export const useFilteredProjectRecords = (projectRecords: ProjectRecordsList) => {
  const { filter } = useProjectRecordFilters()
  const userId = useCurrentUser()?.id
  const status = filter?.status ?? PROJECT_RECORD_FILTER_DEFAULTS.status
  const direction = filter?.direction ?? PROJECT_RECORD_FILTER_DEFAULTS.direction
  const searchterm = filter?.searchterm ?? PROJECT_RECORD_FILTER_DEFAULTS.searchterm
  const tag = filter?.tag

  if (status === "all" && direction === "all" && !searchterm && !tag) return projectRecords

  return projectRecords.filter((projectRecord) => {
    if (status !== "all" && projectRecord.editingState !== status) return false
    if (!matchesTagFilter(projectRecord, tag)) return false
    if (!matchesDirection(projectRecord, direction, userId)) return false
    return matchesSearchterm(projectRecord, searchterm)
  })
}
