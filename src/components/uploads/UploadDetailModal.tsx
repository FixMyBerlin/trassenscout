import { useQuery } from "@tanstack/react-query"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { useModalNavigationGuard } from "@/src/components/core/components/Modal/useModalNavigationGuard"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
import { Upload } from "@/src/prisma/generated/browser"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { UploadDetailPanelContent } from "./UploadDetailPanelContent"
import { isDeletedUploadMarker } from "./uploadTypes"

const UploadDetailModalSkeleton = () => (
  <div className="space-y-4">
    <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
    <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
)

import type { UploadEditLink } from "./uploadTypes"

type Props = {
  uploadId: number | null
  projectSlug: string
  open: boolean
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  editLink?: UploadEditLink
  previewUpload?: Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">
}

export const UploadDetailModal = ({
  uploadId,
  projectSlug,
  open,
  onClose,
  onDeleted,
  editLink,
  previewUpload,
}: Props) => {
  const navigationGuard = useModalNavigationGuard()
  const { data: upload } = useQuery({
    ...uploadQueryOptions({ projectSlug, id: uploadId! }),
    enabled: open && uploadId !== null,
  })

  if (!open || uploadId === null) return null

  const title = upload?.title ?? previewUpload?.title ?? "Dokument wird geladen …"

  if (upload && isDeletedUploadMarker(upload)) {
    return (
      <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-2xl" zIndex={30}>
        <HeadingWithAction>
          <H3>Dokument nicht verfügbar</H3>
          <ModalCloseButton onClose={onClose} />
        </HeadingWithAction>
        <p className="text-sm text-gray-600">Dieses Dokument wurde gelöscht.</p>
      </Modal>
    )
  }

  return (
    <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-2xl" zIndex={30}>
      <HeadingWithAction>
        <H3>{title}</H3>
        <ModalCloseButton onClose={onClose} />
      </HeadingWithAction>

      {upload ? (
        <UploadDetailPanelContent
          upload={upload}
          projectSlug={projectSlug}
          editLink={editLink}
          onEditClick={() => {
            navigationGuard.beginNavigationToModal({ holdUntilNextModalMount: true })
          }}
          onDeleted={
            onDeleted
              ? async () => {
                  await onDeleted()
                  onClose()
                }
              : undefined
          }
        />
      ) : (
        <UploadDetailModalSkeleton />
      )}
    </Modal>
  )
}
