import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
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
}

export const UploadPreviewClickable = ({
  uploadId,
  upload,
  projectSlug,
  size,
  onDeleted,
  editLink,
}: Props) => {
  const queryClient = useQueryClient()
  const projectUploadModal = useProjectUploadModal()
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

  const openPreview = () => {
    if (projectUploadModal && (!editLink || editLink.to === "/$projectSlug/uploads/$uploadId/edit")) {
      projectUploadModal.openUploadDetail({
        uploadId: effectiveUploadId,
        previewUpload: upload,
      })
      warmPreview()
      return
    }

    setIsPreviewOpen(true)
    warmPreview()
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
                await onDeleted()
                setIsPreviewOpen(false)
              }
            : undefined
        }
        editLink={editLink}
      />
    </>
  )
}
