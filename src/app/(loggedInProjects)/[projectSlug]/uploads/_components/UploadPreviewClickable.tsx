"use client"

import { UploadDetailModal } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetailModal"
import { UploadPreview } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreview"
import { UploadSize } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import { blockUntilModalMounts } from "@/src/core/components/Modal/modalCloseGuard"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { getQueryClient, getQueryKey, invoke } from "@blitzjs/rpc"
import { Upload } from "@prisma/client"
import { Route } from "next"
import { useCallback, useState } from "react"

type Props = {
  uploadId: number
  upload?: Pick<Upload, "id" | "mimeType" | "title" | "externalUrl" | "collaborationUrl">
  projectSlug: string
  size: UploadSize
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
}

export const UploadPreviewClickable = ({
  uploadId,
  upload,
  projectSlug,
  size,
  onDeleted,
  editUrl,
}: Props) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const effectiveUploadId = upload?.id ?? uploadId
  const queryKey = getQueryKey(getUploadWithRelations, { projectSlug, id: effectiveUploadId })

  const primeUploadDetails = useCallback(async () => {
    const queryClient = getQueryClient()

    if (queryClient.getQueryData(queryKey)) return

    const fullUpload = await invoke(getUploadWithRelations, {
      projectSlug,
      id: effectiveUploadId,
    })

    queryClient.setQueryData(queryKey, fullUpload)
  }, [effectiveUploadId, projectSlug, queryKey])

  const warmPreview = () => {
    void primeUploadDetails()
  }

  const openPreview = async () => {
    try {
      await primeUploadDetails()
    } finally {
      blockUntilModalMounts()
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
                await onDeleted()
                setIsPreviewOpen(false)
              }
            : undefined
        }
        editUrl={editUrl}
      />
    </>
  )
}
