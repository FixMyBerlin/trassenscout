import type { QueryClient } from "@tanstack/react-query"
import { geolocatedUploadsQueryOptions } from "@/src/server/uploads/geolocatedUploadsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import type { UploadWithRelations } from "./uploadTypes"

function omitUploadById<T extends { id: number }>(items: T[], uploadId: number) {
  return items.filter((item) => item.id !== uploadId)
}

export async function markUploadDeletedInCache(
  queryClient: QueryClient,
  projectSlug: string,
  uploadId: number,
) {
  const uploadOptions = uploadQueryOptions({ projectSlug, id: uploadId })
  await queryClient.cancelQueries({ queryKey: uploadOptions.queryKey })
  queryClient.setQueryData(uploadOptions.queryKey, {
    __deleted: true,
  } as unknown as UploadWithRelations)

  queryClient.setQueriesData({ queryKey: ["uploads"] }, (data) => {
    if (!Array.isArray(data)) return data
    return omitUploadById(data as Array<{ id: number }>, uploadId)
  })
  queryClient.setQueriesData({ queryKey: ["uploadsWithSubsections"] }, (data) => {
    if (!data || typeof data !== "object" || !("uploads" in data)) return data
    const list = data as { uploads: Array<{ id: number }> }
    return { ...list, uploads: omitUploadById(list.uploads, uploadId) }
  })
  queryClient.setQueriesData({ queryKey: ["projectRecord"] }, (data) => {
    if (!data || typeof data !== "object" || !("uploads" in data)) return data
    const record = data as { uploads: Array<{ id: number }> }
    return { ...record, uploads: omitUploadById(record.uploads, uploadId) }
  })
}

export function invalidateUploadLists(queryClient: QueryClient, projectSlug: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: uploadsQueryOptions({ projectSlug }).queryKey }),
    queryClient.invalidateQueries({
      queryKey: geolocatedUploadsQueryOptions({ projectSlug }).queryKey,
    }),
    queryClient.invalidateQueries({ queryKey: ["uploadsWithSubsections"] }),
  ])
}

/** Upload mutations also change linked protocol entries (document list and counts). */
export function invalidateAfterUploadChange(queryClient: QueryClient, projectSlug: string) {
  return Promise.all([
    invalidateUploadLists(queryClient, projectSlug),
    queryClient.invalidateQueries({ queryKey: ["projectRecord"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecords"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsNeedsReview"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsBySubsubsection"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordsByAcquisitionArea"] }),
    queryClient.invalidateQueries({ queryKey: ["projectRecordDeleteInfo"] }),
  ])
}
