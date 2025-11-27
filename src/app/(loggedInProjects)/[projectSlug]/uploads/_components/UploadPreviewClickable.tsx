"use client"

import { UploadDetailModal } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetailModal"
import { UploadPreview } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreview"
import { UploadSize } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import { Route } from "next"
import { useState } from "react"

type Props = {
  uploadId: number
  projectSlug: string
  size: UploadSize
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
}

export const UploadPreviewClickable = ({
  uploadId,
  projectSlug,
  size,
  onDeleted,
  editUrl,
}: Props) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  return (
    <>
      <UploadPreview
        uploadId={uploadId}
        projectSlug={projectSlug}
        size={size}
        showTitle={size !== "table"}
        onClick={() => setIsPreviewOpen(true)}
      />
      <UploadDetailModal
        uploadId={uploadId}
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
