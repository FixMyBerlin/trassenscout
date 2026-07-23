import { Suspense, useEffect } from "react"
import { twJoin } from "tailwind-merge"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { DeleteUploadActionBar } from "./DeleteUploadActionBar"
import { EditUploadForm } from "./EditUploadForm"
import { UploadAuthorAndDates } from "./UploadAuthorAndDates"
import { UploadDetailPanelContent } from "./UploadDetailPanelContent"
import {
  isDeletedUploadMarker,
  type DeletedUploadMarker,
  type UploadWithRelations,
} from "./uploadTypes"

const UploadDetailModalSkeleton = () => (
  <div className={`space-y-4 ${pageContentPaddingClassName}`}>
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
  onClose: () => void
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
  onClose,
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
    return (
      <p className={`text-sm text-gray-600 ${pageContentPaddingClassName}`}>
        Dieses Dokument wurde gelöscht.
      </p>
    )
  }

  if (isEditView && upload) {
    return (
      <Suspense fallback={<UploadDetailModalSkeleton />}>
        <EditUploadForm
          upload={upload}
          returnPath={returnPath}
          returnText="Zurück"
          hideBackLink
          onDeleted={onClose}
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
      <>
        <div className={pageContentPaddingClassName}>
          <UploadDetailPanelContent upload={upload} projectSlug={projectSlug} />
        </div>
        <UploadAuthorAndDates
          createdBy={upload.createdBy}
          createdAt={upload.createdAt}
          updatedBy={upload.updatedBy ?? undefined}
          updatedAt={upload.updatedAt ?? undefined}
          variant="aligned"
        />
        <div className={twJoin("border-t border-gray-200", pageContentPaddingClassName)}>
          <DeleteUploadActionBar
            projectSlug={projectSlug}
            uploadId={upload.id}
            uploadTitle={upload.title}
            returnPath={returnPath}
            onDeleted={onClose}
            variant="linkWithIcon"
          />
        </div>
      </>
    )
  }

  return <UploadDetailModalSkeleton />
}
