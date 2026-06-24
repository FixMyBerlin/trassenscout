import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
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
  zIndex?: number
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
  zIndex = 30,
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
      zIndex={zIndex}
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
  zIndex,
  closeOnEditSuccess,
}: InnerProps) {
  const uploadQuery = useQuery({
    ...uploadQueryOptions({ projectSlug, id: uploadId }),
    enabled: true,
  })
  const upload = uploadQuery.data
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
      className={isEditView ? "space-y-4" : "space-y-4 sm:max-w-2xl"}
      zIndex={zIndex}
    >
      <HeadingWithAction>
        <H3>{title}</H3>
        <ModalCloseButton onClose={handleClose} />
      </HeadingWithAction>

      {hasUploadError ? (
        <Notice type="error" title="Das Dokument konnte nicht geladen werden.">
          <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
        </Notice>
      ) : isUploadUnavailable ? (
        <Notice type="warn" title="Dieses Dokument ist nicht mehr verfügbar.">
          <p>Es wurde möglicherweise gelöscht oder ist für Sie nicht mehr zugänglich.</p>
        </Notice>
      ) : (
        <UploadModalContent
          upload={upload}
          projectSlug={projectSlug}
          isEditView={isEditView}
          returnPath={editLink?.search?.returnTo ?? `/${projectSlug}/uploads`}
          editLink={editLink}
          onClose={onClose}
          onDeleted={
            onDeleted
              ? async () => {
                  onClose()
                  await onDeleted()
                }
              : undefined
          }
          onEditClick={(event) => {
            if (!canEditInLocalModal) return

            event.preventDefault()
            setIsDirty(false)
            setIsSubmitting(false)
            setView("edit")
          }}
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
