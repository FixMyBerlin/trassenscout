import type { QueryClient } from "@tanstack/react-query"
import { geolocatedUploadsQueryOptions } from "@/src/server/uploads/geolocatedUploadsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { uploadsQueryOptions } from "@/src/server/uploads/uploadsQueryOptions"
import type { UploadWithRelations } from "./uploadTypes"

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
}

export function invalidateUploadLists(queryClient: QueryClient, projectSlug: string) {
  void queryClient.invalidateQueries({ queryKey: uploadsQueryOptions({ projectSlug }).queryKey })
  void queryClient.invalidateQueries({
    queryKey: geolocatedUploadsQueryOptions({ projectSlug }).queryKey,
  })
}
