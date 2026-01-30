"use client"

import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getGeolocatedUploads from "@/src/server/uploads/queries/getGeolocatedUploads"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { Route } from "next"

type Props = {
  projectSlug: string
  uploadId: number
  uploadTitle: string
  returnPath: Route
  variant?: "text" | "icon"
}

export const DeleteUploadActionBar = ({
  projectSlug,
  uploadId,
  uploadTitle,
  returnPath,
  variant = "icon",
}: Props) => {
  const [deleteUploadMutation] = useMutation(deleteUpload)

  const handleDelete = async () => {
    // This delete component is used in very different contexts.
    // When we delete a file, some other queries on the page can try to re-fetch the deleted upload and fail.
    // Testing hint: Sometimes this requires a reload of the page to trigger the error between upload and deletion.
    // To fix this, we have to invalidate or even remove all kinds of queries that might be affected by the deletion.
    const queryClient = getQueryClient()
    const uploadQueryKey = getQueryKey(getUploadWithRelations, { projectSlug, id: uploadId })

    // Cancel any in-flight requests for this upload
    await queryClient.cancelQueries({ queryKey: uploadQueryKey })

    await deleteUploadMutation({ projectSlug, id: uploadId })

    // Set query data to a deleted marker object to prevent refetches
    // This keeps the query in cache but marks it as deleted
    // We keep it in cache (don't remove) so React Query won't try to refetch it
    queryClient.setQueryData(uploadQueryKey, { __deleted: true } as any)

    // Invalidate the uploads lists so they refetch without the deleted upload
    const geolocatedQueryKey = getQueryKey(getGeolocatedUploads, { projectSlug })
    void queryClient.invalidateQueries(geolocatedQueryKey)
    const uploadsListQueryKey = getQueryKey(getUploadsWithSubsections, { projectSlug })
    void queryClient.invalidateQueries(uploadsListQueryKey)
  }

  return (
    <DeleteActionBar
      itemTitle={uploadTitle}
      onDelete={handleDelete}
      returnPath={returnPath}
      variant={variant}
    />
  )
}
