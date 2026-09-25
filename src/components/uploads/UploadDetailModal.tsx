import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "@/src/components/core/components/links/Link"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useCurrentReturnTo } from "@/src/components/core/routes/useCurrentPathWithSearch"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { Upload } from "@/src/prisma/generated/browser"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { UploadModalContent } from "./UploadModalContent"
import type { UploadEditLink } from "./uploadTypes"

type Props = {
  uploadId: number | null
  projectSlug: string
  open: boolean
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  editLink?: UploadEditLink
  previewUpload?: Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">
  closeOnEditSuccess?: boolean
}

export const UploadDetailModal = ({
  uploadId,
  projectSlug,
  open,
  onClose,
  onDeleted,
  editLink,
  previewUpload,
  closeOnEditSuccess = false,
}: Props) => {
  if (!open || uploadId === null) return null

  return (
    <UploadDetailModalInner
      key={uploadId}
      uploadId={uploadId}
      projectSlug={projectSlug}
      onClose={onClose}
      onDeleted={onDeleted}
      editLink={editLink}
      previewUpload={previewUpload}
      closeOnEditSuccess={closeOnEditSuccess}
    />
  )
}

type InnerProps = Omit<Props, "open" | "uploadId"> & {
  uploadId: number
}

function UploadDetailModalInner({
  uploadId,
  projectSlug,
  onClose,
  onDeleted,
  editLink,
  previewUpload,
  closeOnEditSuccess,
}: InnerProps) {
  const uploadQuery = useQuery({
    ...uploadQueryOptions({ projectSlug, id: uploadId }),
    enabled: true,
  })
  const upload = uploadQuery.data
  // This modal also opens from the dashboard, which has no project route match.
  const userCanEdit = useUserCan(projectSlug).edit
  const routeProjectSlug = useTryRouteParam("projectSlug")
  const [view, setView] = useState<"detail" | "edit">("detail")
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditView = view === "edit"
  const hasUploadError = Boolean(uploadQuery.error)
  const isUploadUnavailable = !uploadQuery.isPending && !upload
  const title = isEditView
    ? "Dokument bearbeiten"
    : hasUploadError || isUploadUnavailable
      ? "Dokument"
      : (upload?.title ?? previewUpload?.title ?? "Dokument wird geladen …")

  const canEditInLocalModal = editLink?.to === "/$projectSlug/uploads/$uploadId/edit"
  // In-place editing reads params from the project route. Off that route, follow the edit link.
  const canEditInPlace = canEditInLocalModal && routeProjectSlug !== undefined
  const returnTo = useCurrentReturnTo()
  const editSearch =
    editLink && returnTo && !editLink.search?.returnTo
      ? { ...editLink.search, returnTo }
      : editLink?.search

  const handleClose = () => {
    if (isEditView && isSubmitting) return
    if (isEditView && isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return

    if (isEditView) {
      setIsDirty(false)
      setIsSubmitting(false)
      setView("detail")
      return
    }

    onClose()
  }

  return (
    <Modal
      open
      handleClose={handleClose}
      align={isEditView ? "right" : "center"}
      className={isEditView ? undefined : "sm:max-w-2xl"}
    >
      <PageHeader
        title={title}
        action={
          <div className="flex items-center gap-4">
            {!isEditView && editLink && upload && userCanEdit ? (
              <Link
                icon="edit"
                to={editLink.to}
                params={editLink.params}
                search={editSearch}
                preload={false}
                replace
                resetScroll={false}
                onClick={(event) => {
                  if (!canEditInPlace) {
                    onClose()
                    return
                  }

                  event.preventDefault()
                  setIsDirty(false)
                  setIsSubmitting(false)
                  setView("edit")
                }}
              >
                bearbeiten
              </Link>
            ) : null}
            <ModalCloseButton onClose={handleClose} />
          </div>
        }
      />

      {hasUploadError ? (
        <div className={pageContentPaddingClassName}>
          <Notice type="error" title="Das Dokument konnte nicht geladen werden.">
            <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
          </Notice>
        </div>
      ) : isUploadUnavailable ? (
        <div className={pageContentPaddingClassName}>
          <Notice type="warn" title="Dieses Dokument ist nicht mehr verfügbar.">
            <p>Es wurde möglicherweise gelöscht oder ist für Sie nicht mehr zugänglich.</p>
          </Notice>
        </div>
      ) : (
        <UploadModalContent
          upload={upload}
          projectSlug={projectSlug}
          isEditView={isEditView}
          returnPath={editLink?.search?.returnTo ?? `/${projectSlug}/uploads`}
          onClose={onClose}
          onDeleted={onDeleted}
          onEditSuccess={async () => {
            if (closeOnEditSuccess) {
              onClose()
              return
            }

            setView("detail")
          }}
          onDirtyChange={setIsDirty}
          onSubmittingChange={setIsSubmitting}
          deletedState="close"
        />
      )}
    </Modal>
  )
}
