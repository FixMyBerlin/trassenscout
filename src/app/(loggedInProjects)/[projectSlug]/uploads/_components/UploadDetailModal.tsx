"use client"

import { UploadDetailPanelContent } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetailPanelContent"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { useModalNavigationGuard } from "@/src/core/components/Modal/useModalNavigationGuard"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { useQuery } from "@blitzjs/rpc"
import { Upload } from "@prisma/client"
import { Route } from "next"

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

type Props = {
  uploadId: number | null
  projectSlug: string
  open: boolean
  onClose: () => void
  onDeleted?: () => void | Promise<void>
  editUrl?: Route
  previewUpload?: Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">
}

export const UploadDetailModal = ({
  uploadId,
  projectSlug,
  open,
  onClose,
  onDeleted,
  editUrl,
  previewUpload,
}: Props) => {
  const navigationGuard = useModalNavigationGuard()
  const [upload] = useQuery(
    getUploadWithRelations,
    { projectSlug, id: uploadId! },
    {
      enabled: open && uploadId !== null,
      suspense: false,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  )

  if (!open || uploadId === null) return null

  if (upload && (upload as any).__deleted) return null

  const title = upload?.title ?? previewUpload?.title ?? "Dokument wird geladen …"

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
          editUrl={editUrl}
          onEditClick={() => {
            navigationGuard.beginNavigationToModal({ holdUntilNextModalMount: true })
            onClose()
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
