import getProjectRecords from "@/src/server/projectRecord/queries/getProjectRecords"
import { useFilters } from "./useFilters.nuqs"

export const useFilteredProjectRecords = (
  projectRecords: Awaited<ReturnType<typeof getProjectRecords>>,
) => {
  const { filter } = useFilters()

  if (!filter || !filter.searchterm) return projectRecords

  const { searchterm } = filter

  const filtered = projectRecords.filter((projectRecord) => {
    if (!searchterm) return projectRecord

    // Remove hashtags from search term and trim any remaining whitespace
    const cleanedSearchterm = searchterm.trim().toLowerCase().replace(/#/g, "").trim()

    return (
      projectRecord.title?.toLowerCase().includes(cleanedSearchterm) ||
      projectRecord.body?.toLowerCase().includes(cleanedSearchterm) ||
      projectRecord.projectRecordTopics.some((topic) =>
        topic.title.toLowerCase().includes(cleanedSearchterm),
      ) ||
      projectRecord.subsection?.slug.toLowerCase().includes(cleanedSearchterm)
    )
  })

  return filtered
}
