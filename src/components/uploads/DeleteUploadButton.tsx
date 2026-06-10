import { TrashIcon } from "@heroicons/react/24/outline"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { clsx } from "clsx"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { deleteUploadFn } from "@/src/server/uploads/uploads.functions"
import { invalidateUploadLists, markUploadDeletedInCache } from "./uploadQueryCache"

type Props = {
  projectSlug: string
  uploadId: number
  uploadTitle: string
  onDeleted: () => Promise<void> | void
  variant?: "link" | "icon" | "linkWithIcon"
  className?: string
}

export const DeleteUploadButton = ({
  projectSlug,
  uploadId,
  uploadTitle,
  onDeleted,
  variant = "linkWithIcon",
  className,
}: Props) => {
  const queryClient = useQueryClient()
  const deleteUploadMutation = useMutation({
    mutationFn: deleteUploadFn,
  })

  const handleDelete = async () => {
    if (
      window.confirm(
        `Möchten Sie das Dokument ${frenchQuote(uploadTitle)} wirklich unwiderruflich löschen?`,
      )
    ) {
      try {
        await markUploadDeletedInCache(queryClient, projectSlug, uploadId)
        await deleteUploadMutation.mutateAsync({ data: { projectSlug, id: uploadId } })
        invalidateUploadLists(queryClient, projectSlug)
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
        className={clsx(linkStyles, "cursor-pointer", className)}
        title="Dokument löschen"
      >
        <TrashIcon className="size-5" />
      </button>
    ),
    link: (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
          className,
        )}
      >
        Dokument löschen
      </button>
    ),
    linkWithIcon: (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
          className,
        )}
      >
        {linkIcons["delete"]}
        Löschen
      </button>
    ),
  }

  return variantButton[variant]
}
