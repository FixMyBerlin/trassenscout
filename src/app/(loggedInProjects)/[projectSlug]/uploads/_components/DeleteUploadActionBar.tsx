"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getGeolocatedUploads from "@/src/server/uploads/queries/getGeolocatedUploads"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/24/outline"
import { blueButtonStyles } from "@/src/core/components/links"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { frenchQuote } from "@/src/core/components/text/quote"

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
  const router = useRouter()
  const [deleteUploadMutation] = useMutation(deleteUpload)

  const handleDelete = async () => {
    if (
      window.confirm(
        `Möchten Sie das Dokument ${frenchQuote(uploadTitle)} wirklich unwiderruflich löschen?`,
      )
    ) {
      try {
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
        await router.push(returnPath as Route<string>)
      } catch (error) {
        console.error("Error deleting upload:", error)
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <IfUserCanEdit>
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(
          blueButtonStyles,
          "enabled:hover:bg-red-600 enabled:hover:text-white",
          "enabled:active:bg-red-500 enabled:active:ring-red-600",
        )}
        title="Dokument löschen"
      >
        {variant === "icon" ? (
          <TrashIcon className="size-5" />
        ) : (
          "Löschen"
        )}
      </button>
    </IfUserCanEdit>
  )
}
