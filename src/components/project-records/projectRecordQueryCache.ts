import type { QueryClient } from "@tanstack/react-query"
import { invalidateUploadLists } from "@/src/components/uploads/uploadQueryCache"

export function invalidateAfterProjectRecordChange(queryClient: QueryClient, projectSlug: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["projectRecords"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsAdmin"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsNeedsReview"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsTabCounts"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsBySubsubsection"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsByAcquisitionArea"] }),
    invalidateUploadLists(queryClient, projectSlug),
    queryClient.invalidateQueries({ queryKey: ["upload"] }),
  ])
}
