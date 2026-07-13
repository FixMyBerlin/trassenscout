import { getFullname } from "@/src/components/core/users/getFullname"
import type { ProjectRecordsList } from "@/src/server/projectRecords/types"
import { useProjectRecordFilters } from "../useProjectRecordFilters"

export const useFilteredProjectRecords = (projectRecords: ProjectRecordsList) => {
  const { filter } = useProjectRecordFilters()

  if (!filter || !filter.searchterm) return projectRecords

  const { searchterm } = filter

  const filtered = projectRecords.filter((projectRecord) => {
    if (!searchterm) return projectRecord

    // Remove hashtags from search term and trim any remaining whitespace
    const cleanedSearchterm = searchterm.trim().toLowerCase().replace(/#/g, "").trim()

    const assigneeName = projectRecord.assignedTo
      ? (getFullname(projectRecord.assignedTo)?.trim().toLowerCase() ?? "")
      : ""

    return (
      projectRecord.title?.toLowerCase().includes(cleanedSearchterm) ||
      projectRecord.body?.toLowerCase().includes(cleanedSearchterm) ||
      projectRecord.tags.some((tag) => tag.title.toLowerCase().includes(cleanedSearchterm)) ||
      assigneeName.includes(cleanedSearchterm)
    )
  })

  return filtered
}
