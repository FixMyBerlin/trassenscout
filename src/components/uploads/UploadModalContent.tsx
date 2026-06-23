import type { MouseEventHandler } from "react"
import { Suspense, useEffect } from "react"
import { EditUploadForm } from "./EditUploadForm"
import { UploadDetailPanelContent } from "./UploadDetailPanelContent"
import {
  isDeletedUploadMarker,
  type DeletedUploadMarker,
  type UploadEditLink,
  type UploadWithRelations,
} from "./uploadTypes"

export const UploadDetailModalSkeleton = () => (
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

type Props = {
  upload: UploadWithRelations | DeletedUploadMarker | undefined
  projectSlug: string
  isEditView: boolean
  returnPath: string
  editLink?: UploadEditLink
  editHref?: string
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  onEditClick?: MouseEventHandler<HTMLAnchorElement>
  onEditSuccess: () => void | Promise<void>
  onDirtyChange?: (isDirty: boolean) => void
  onSubmittingChange?: (isSubmitting: boolean) => void
  deletedState?: "close" | "message"
}

export const UploadModalContent = ({
  upload,
  projectSlug,
  isEditView,
  returnPath,
  editLink,
  editHref,
  onClose,
  onDeleted,
  onEditClick,
  onEditSuccess,
  onDirtyChange,
  onSubmittingChange,
  deletedState = "message",
}: Props) => {
  useEffect(() => {
    if (deletedState !== "close") return
    if (!upload || !isDeletedUploadMarker(upload)) return

    onClose()
  }, [deletedState, onClose, upload])

  if (upload && isDeletedUploadMarker(upload)) {
    if (deletedState === "close") return null
    return <p className="text-sm text-gray-600">Dieses Dokument wurde gelöscht.</p>
  }

  if (isEditView && upload) {
    return (
      <Suspense fallback={<UploadDetailModalSkeleton />}>
        <EditUploadForm
          upload={upload}
          returnPath={returnPath}
          returnText="Zurück"
          showDelete={false}
          hideBackLink
          onDirtyChange={onDirtyChange}
          onSubmittingChange={onSubmittingChange}
          onSuccess={async () => {
            onDirtyChange?.(false)
            onSubmittingChange?.(false)
            await onEditSuccess()
          }}
        />
      </Suspense>
    )
  }

  if (upload) {
    return (
      <UploadDetailPanelContent
        upload={upload}
        projectSlug={projectSlug}
        editLink={editLink}
        editHref={editHref}
        onEditClick={onEditClick}
        onDeleted={onDeleted}
      />
    )
  }

  return <UploadDetailModalSkeleton />
}
