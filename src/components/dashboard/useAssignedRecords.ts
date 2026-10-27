import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { matchesTagFilter } from "@/src/components/tags/tagFilterOptions"
import { useTagFilterOptions } from "@/src/components/tags/useTagFilterOptions"
import { myAssignedRecordsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { AssignmentsSearch } from "@/src/shared/dashboard/searchSchemas"

export function useAssignedRecords(projectSlug: string | undefined, search: AssignmentsSearch) {
  const {
    data: records,
    isError,
    isPlaceholderData,
  } = useQuery({
    ...myAssignedRecordsQueryOptions({
      projectSlug,
      direction: search.direction,
      editingState: search.status === "all" ? undefined : search.status,
    }),
    placeholderData: keepPreviousData,
  })
  const tagOptions = useTagFilterOptions(records ?? [], projectSlug)

  return {
    records: records?.filter((record) => matchesTagFilter(record, search.tag)),
    isError,
    isPlaceholderData,
    tagOptions,
  }
}
