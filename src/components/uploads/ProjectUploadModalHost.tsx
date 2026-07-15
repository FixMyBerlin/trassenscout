import { useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import type { Upload } from "@/src/prisma/generated/browser"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type PreviewUpload = Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">

export function useProjectUploadModal() {
  const queryClient = useQueryClient()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const modalSearch = loggedInProjectRouteApi.useSearch()
  const { buildModalHref, updateModalSearch } = useProjectModalNavigation()

  const getUploadEditHref = ({ uploadId }: { uploadId: number }) =>
    buildModalHref({
      modalUploadId: uploadId,
      modalUploadView: "edit",
    })

  const openUploadDetail = (input: { uploadId: number; previewUpload?: PreviewUpload }) => {
    void queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId }))
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
    void Promise.all([
      queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId })),
      queryClient.ensureQueryData(subsubsectionsQueryOptions({ projectSlug })),
      queryClient.ensureQueryData(acquisitionAreasQueryOptions({ projectSlug })),
    ])
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
