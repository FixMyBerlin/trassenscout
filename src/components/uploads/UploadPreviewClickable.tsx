import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { useIsInsideModal } from "@/src/components/core/components/Modal"
import { Upload } from "@/src/prisma/generated/browser"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { getUploadFn } from "@/src/server/uploads/uploads.functions"
import { useProjectUploadModal } from "./ProjectUploadModalHost"
import { UploadDetailModal } from "./UploadDetailModal"
import { UploadPreview } from "./UploadPreview"
import type { UploadEditLink } from "./uploadTypes"
import { UploadSize } from "./utils/uploadSizes"

type Props = {
  uploadId: number
  upload?: Pick<Upload, "id" | "mimeType" | "title" | "externalUrl" | "collaborationUrl">
  projectSlug: string
  size: UploadSize
  onDeleted?: () => void | Promise<void>
  editLink?: UploadEditLink
  closeOnEditSuccess?: boolean
}

export const UploadPreviewClickable = ({
  uploadId,
  upload,
  projectSlug,
  size,
  onDeleted,
  editLink,
  closeOnEditSuccess = false,
}: Props) => {
  const queryClient = useQueryClient()
  const projectUploadModal = useProjectUploadModal()
  // Inside another modal, the URL-hosted upload modal would navigate and collapse
  // the parent, so keep the whole flow in a local modal that stacks on top.
  const insideModal = useIsInsideModal()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const effectiveUploadId = upload?.id ?? uploadId
  const uploadOptions = uploadQueryOptions({ projectSlug, id: effectiveUploadId })

  const primeUploadDetails = useCallback(async () => {
    if (queryClient.getQueryData(uploadOptions.queryKey)) return

    const fullUpload = await getUploadFn({ data: { projectSlug, id: effectiveUploadId } })
    queryClient.setQueryData(uploadOptions.queryKey, fullUpload)
  }, [effectiveUploadId, projectSlug, queryClient, uploadOptions.queryKey])

  const warmPreview = () => {
    void primeUploadDetails()
  }

  const openPreview = async () => {
    if (
      !insideModal &&
      projectUploadModal &&
      (!editLink || editLink.to === "/$projectSlug/uploads/$uploadId/edit")
    ) {
      try {
        await primeUploadDetails()
      } finally {
        projectUploadModal.openUploadDetail({
          uploadId: effectiveUploadId,
          previewUpload: upload,
        })
      }
      return
    }

    try {
      await primeUploadDetails()
    } finally {
      setIsPreviewOpen(true)
    }
  }

  return (
    <>
      <UploadPreview
        {...(upload ? { upload } : { uploadId: effectiveUploadId })}
        projectSlug={projectSlug}
        size={size}
        showTitle={size !== "table"}
        onPointerEnter={warmPreview}
        onFocus={warmPreview}
        onClick={openPreview}
      />
      <UploadDetailModal
        uploadId={effectiveUploadId}
        previewUpload={upload}
        projectSlug={projectSlug}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDeleted={
          onDeleted
            ? async () => {
                setIsPreviewOpen(false)
                await onDeleted()
              }
            : undefined
        }
        editLink={editLink}
        closeOnEditSuccess={closeOnEditSuccess}
      />
    </>
  )
}
