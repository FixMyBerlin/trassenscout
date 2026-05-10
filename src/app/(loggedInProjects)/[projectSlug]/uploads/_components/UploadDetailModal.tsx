"use client"

import { UploadDetailPanelContent } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetailPanelContent"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { useModalNavigationGuard } from "@/src/core/components/Modal/useModalNavigationGuard"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"

type Props = {
  uploadId: number | null
  projectSlug: string
  open: boolean
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
}

export const UploadDetailModal = ({
  uploadId,
  projectSlug,
  open,
  onClose,
  onDeleted,
  editUrl,
}: Props) => {
  const navigationGuard = useModalNavigationGuard()
  const [upload] = useQuery(
    getUploadWithRelations,
    { projectSlug, id: uploadId! },
    {
      enabled: open && uploadId !== null,
      suspense: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  if (!open || uploadId === null) return null

  if (!upload) {
    return (
      <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-2xl">
        <HeadingWithAction>
          <H3>Dokument wird geladen …</H3>
          <ModalCloseButton onClose={onClose} />
        </HeadingWithAction>
      </Modal>
    )
  }

  // Check if upload was marked as deleted
  if ((upload as any).__deleted) return null

  return (
    <Modal open={open} handleClose={onClose} className="space-y-4 sm:max-w-2xl">
      <HeadingWithAction>
        <H3>{upload.title}</H3>
        <ModalCloseButton onClose={onClose} />
      </HeadingWithAction>

      <UploadDetailPanelContent
        upload={upload}
        projectSlug={projectSlug}
        editUrl={editUrl}
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
    </Modal>
  )
}
