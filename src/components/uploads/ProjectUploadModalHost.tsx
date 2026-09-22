import { useQueryClient } from "@tanstack/react-query"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { useProjectModalSearch } from "@/src/components/shared/projectModals/useProjectModalSearch"
import { useProjectModalSlug } from "@/src/components/shared/projectModals/useProjectModalSlug"
import type { Upload } from "@/src/prisma/generated/browser"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

type PreviewUpload = Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">
type HostedUploadDeletedHandler = () => void | Promise<void>

// The URL-hosted upload modal lives in ProjectModalHost, far away from the table row
// that opened it. Callbacks cannot travel through the URL, so the opener parks its
// `onDeleted` here and the host takes it when the document is deleted or the modal
// closes (see `takeHostedUploadDeletedHandler`). Only ever set from client event handlers.
let hostedUploadDeletedHandler: HostedUploadDeletedHandler | undefined

export function takeHostedUploadDeletedHandler() {
  const handler = hostedUploadDeletedHandler
  hostedUploadDeletedHandler = undefined
  return handler
}

export function useProjectUploadModal() {
  const queryClient = useQueryClient()
  const projectSlug = useProjectModalSlug()
  const modalSearch = useProjectModalSearch()
  const { buildModalHref, updateModalSearch } = useProjectModalNavigation()

  const getUploadEditHref = ({ uploadId }: { uploadId: number }) =>
    buildModalHref({
      modalUploadId: uploadId,
      modalUploadView: "edit",
    })

  const openUploadDetail = (input: {
    uploadId: number
    previewUpload?: PreviewUpload
    onDeleted?: HostedUploadDeletedHandler
  }) => {
    // Omitting `onDeleted` keeps the current handler: the edit view re-opens the detail
    // view after saving and must not drop the callback of the row that opened it.
    if ("onDeleted" in input) hostedUploadDeletedHandler = input.onDeleted
    if (projectSlug) {
      void queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId }))
    }
    void updateModalSearch(
      {
        modalUploadId: input.uploadId,
        modalUploadView: "detail",
      },
      {
        replace: modalSearch.modalUploadId === input.uploadId,
        preview: input.previewUpload ? { type: "upload", upload: input.previewUpload } : undefined,
      },
    )
  }

  const openUploadEdit = (input: { uploadId: number }) => {
    if (projectSlug) {
      void Promise.all([
        queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId })),
        queryClient.ensureQueryData(subsubsectionsQueryOptions({ projectSlug })),
        queryClient.ensureQueryData(acquisitionAreasQueryOptions({ projectSlug })),
      ])
    }
    void updateModalSearch(
      {
        modalUploadId: input.uploadId,
        modalUploadView: "edit",
      },
      {
        replace:
          modalSearch.modalUploadId === input.uploadId && modalSearch.modalUploadView === "edit",
      },
    )
  }

  return {
    openUploadDetail,
    openUploadEdit,
    getUploadEditHref,
  }
}
