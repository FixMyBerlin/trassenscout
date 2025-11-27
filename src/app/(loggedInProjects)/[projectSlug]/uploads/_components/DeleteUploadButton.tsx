"use client"

import { linkIcons, linkStyles } from "@/src/core/components/links"
import { frenchQuote } from "@/src/core/components/text/quote"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getGeolocatedUploads from "@/src/server/uploads/queries/getGeolocatedUploads"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"

type Props = {
  projectSlug: string
  uploadId: number
  uploadTitle: string
  onDeleted: () => Promise<void> | void
  variant?: "link" | "icon"
  className?: string
}

export const DeleteUploadButton = ({
  projectSlug,
  uploadId,
  uploadTitle,
  onDeleted,
  variant = "link",
  className,
}: Props) => {
  // temorary early return to disable deletion of uploads
  const [deleteUploadMutation] = useMutation(deleteUpload)
  return

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
        await deleteUploadMutation({ projectSlug, id: uploadId })
        // Remove the specific upload query from cache (no refetch to avoid errors)
        const uploadQueryKey = getQueryKey(getUploadWithRelations, { projectSlug, id: uploadId })
        void getQueryClient().removeQueries({ queryKey: uploadQueryKey })
        // Invalidate the uploads lists so they refetch without the deleted upload
        const geolocatedQueryKey = getQueryKey(getGeolocatedUploads, { projectSlug })
        void getQueryClient().invalidateQueries(geolocatedQueryKey)
        const uploadsListQueryKey = getQueryKey(getUploadsWithSubsections, { projectSlug })
        void getQueryClient().invalidateQueries(uploadsListQueryKey)
        await onDeleted()
      } catch (error) {
        console.error("Error deleting upload:", error)
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  const variantButton = {
    icon: (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(linkStyles, className)}
        title="Dokument löschen"
      >
        <TrashIcon className="size-5" />
      </button>
    ),
    link: (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx("inline-flex items-center justify-center gap-1", linkStyles, className)}
      >
        {linkIcons["delete"]}
        Löschen
      </button>
    ),
  }

  return variantButton[variant]
}
