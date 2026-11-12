import type { QueryClient } from "@tanstack/react-query"
import { invalidateUploadLists } from "@/src/components/uploads/uploadQueryCache"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

function invalidateProjectRecordLists(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["projectRecords"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsNeedsReview"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsTabCounts"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsBySubsubsection"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsByAcquisitionArea"] }),
  ])
}

export function invalidateAfterProjectRecordChange(queryClient: QueryClient, projectSlug: string) {
  return Promise.all([
    invalidateProjectRecordLists(queryClient),
    invalidateUploadLists(queryClient, projectSlug),
    queryClient.invalidateQueries({ queryKey: ["upload"] }),
  ])
}

export function invalidateAfterProjectRecordPatch(
  queryClient: QueryClient,
  input: { projectSlug: string; id: number },
) {
  void invalidateProjectRecordLists(queryClient)
  return queryClient.invalidateQueries({ queryKey: projectRecordQueryOptions(input).queryKey })
}
