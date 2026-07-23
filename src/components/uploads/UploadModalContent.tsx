import type { MouseEventHandler } from "react"
import { Suspense, useEffect } from "react"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { DeleteUploadActionBar } from "./DeleteUploadActionBar"
import { EditUploadForm } from "./EditUploadForm"
import { UploadAuthorAndDates } from "./UploadAuthorAndDates"
import { UploadDetailPanelContent } from "./UploadDetailPanelContent"
import {
  isDeletedUploadMarker,
  type DeletedUploadMarker,
  type UploadEditLink,
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
  const returnTo = useCurrentReturnTo()
  const editSearch =
    editLink && returnTo && !editLink.search?.returnTo
      ? { ...editLink.search, returnTo }
      : editLink?.search

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
      <>
        <div className={pageContentPaddingClassName}>
          <UploadDetailPanelContent upload={upload} projectSlug={projectSlug} />
        </div>
        {(editLink || onDeleted) && (
          <IfUserCanEdit>
            <ActionBar
              left={
                editLink ? (
                  <Link
                    button="blue"
                    to={editHref ?? editLink.to}
                    params={editHref ? undefined : editLink.params}
                    search={editHref ? undefined : editSearch}
                    preload={false}
                    replace
                    resetScroll={false}
                    onClick={onEditClick}
                  >
                    Bearbeiten
                  </Link>
                ) : undefined
              }
              right={
                onDeleted ? (
                  <DeleteUploadActionBar
                    projectSlug={projectSlug}
                    uploadId={upload.id}
                    uploadTitle={upload.title}
                    returnPath={returnPath}
                    onDeleted={onDeleted}
                  />
                ) : undefined
              }
            />
          </IfUserCanEdit>
        )}
        <div className={pageContentPaddingClassName}>
          <UploadAuthorAndDates
            createdBy={upload.createdBy}
            createdAt={upload.createdAt}
            updatedBy={upload.updatedBy ?? undefined}
            updatedAt={upload.updatedAt ?? undefined}
            variant="aligned"
          />
        </div>
      </>
    )
  }

  return <UploadDetailModalSkeleton />
}
