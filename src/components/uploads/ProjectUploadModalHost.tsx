import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useLocation, useRouter, useSearch } from "@tanstack/react-router"
import { createContext, useContext, useState } from "react"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
import type { Upload } from "@/src/prisma/generated/browser"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { clearProjectRecordModalSearch } from "@/src/shared/projectRecords/searchSchemas"
import { clearProjectUploadModalSearch } from "@/src/shared/uploads/searchSchemas"
import { UploadModalContent } from "./UploadModalContent"
import { isDeletedUploadMarker } from "./uploadTypes"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type PreviewUpload = Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">

type ProjectUploadModalContextValue = {
  openUploadDetail: (input: { uploadId: number; previewUpload?: PreviewUpload }) => void
  openUploadEdit: (input: { uploadId: number }) => void
  getUploadEditHref: (input: { uploadId: number }) => string
}

const ProjectUploadModalContext = createContext<ProjectUploadModalContextValue | null>(null)

function ProjectUploadModalHostInner({ children }: { children: React.ReactNode }) {
  const navigate = loggedInProjectRouteApi.useNavigate()
  const queryClient = useQueryClient()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const location = useLocation()
  const router = useRouter()
  const modalSearch = loggedInProjectRouteApi.useSearch()
  const activeSearch = useSearch({
    strict: false,
    shouldThrow: false,
  })
  const currentSearch = activeSearch ?? {}
  const backgroundSearch = clearProjectRecordModalSearch(
    clearProjectUploadModalSearch(currentSearch),
  )
  const modalUploadId = modalSearch.modalUploadId
  const modalUploadView = modalSearch.modalUploadView
  const [previewUpload, setPreviewUpload] = useState<PreviewUpload | undefined>(undefined)
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildUploadModalHref = ({
    uploadId,
    view,
  }: {
    uploadId: number
    view: "detail" | "edit"
  }) =>
    router.buildLocation({
      to: location.pathname,
      search: {
        ...backgroundSearch,
        modalUploadId: String(uploadId),
        modalUploadView: view,
      },
    }).href

  const updateModalState = async ({
    replace = false,
    uploadId,
    view,
  }: {
    uploadId?: number
    view?: "detail" | "edit"
    replace?: boolean
  }) => {
    await navigate({
      to: location.pathname,
      search:
        uploadId && view
          ? {
              ...backgroundSearch,
              modalUploadId: uploadId,
              modalUploadView: view,
            }
          : backgroundSearch,
      replace,
      resetScroll: false,
    })
  }

  const closeModal = () => {
    if (isEditView && isSubmitting) return
    if (isEditView && isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return

    setIsDirty(false)
    setIsSubmitting(false)
    setPreviewUpload(undefined)

    void updateModalState({ replace: true })
  }

  const backgroundHref = router.buildLocation({
    to: location.pathname,
    search: backgroundSearch,
  }).href

  const openUploadDetail = (input: { uploadId: number; previewUpload?: PreviewUpload }) => {
    setPreviewUpload(input.previewUpload)
    setIsDirty(false)
    setIsSubmitting(false)
    void queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId }))
    void updateModalState({
      uploadId: input.uploadId,
      view: "detail",
      replace: modalUploadId === input.uploadId,
    })
  }

  const openUploadEdit = (input: { uploadId: number }) => {
    setIsDirty(false)
    setIsSubmitting(false)
    void Promise.all([
      queryClient.ensureQueryData(uploadQueryOptions({ projectSlug, id: input.uploadId })),
      queryClient.ensureQueryData(subsubsectionsQueryOptions({ projectSlug })),
      queryClient.ensureQueryData(acquisitionAreasQueryOptions({ projectSlug })),
    ])
    void updateModalState({
      uploadId: input.uploadId,
      view: "edit",
      replace: modalUploadId === input.uploadId && modalUploadView === "edit",
    })
  }

  const contextValue: ProjectUploadModalContextValue = {
    openUploadDetail,
    openUploadEdit,
    getUploadEditHref: ({ uploadId }) => buildUploadModalHref({ uploadId, view: "edit" }),
  }

  const uploadQuery = useQuery({
    ...uploadQueryOptions({ projectSlug, id: modalUploadId ?? 0 }),
    enabled: modalUploadId !== undefined,
  })
  const upload = uploadQuery.data

  const isOpen = modalUploadId !== undefined && modalUploadView !== undefined
  const isEditView = modalUploadView === "edit"
  const hasUploadError = Boolean(uploadQuery.error)
  const isUploadUnavailable = !uploadQuery.isPending && !upload
  const modalTitle = isEditView
    ? "Dokument bearbeiten"
    : hasUploadError || isUploadUnavailable
      ? "Dokument"
      : upload && !isDeletedUploadMarker(upload)
        ? upload.title
        : (previewUpload?.title ?? "Dokument wird geladen …")

  return (
    <ProjectUploadModalContext.Provider value={contextValue}>
      <>
        {children}
        {isOpen ? (
          <Modal
            open
            handleClose={closeModal}
            align={isEditView ? "right" : "center"}
            className={isEditView ? "space-y-4" : "space-y-4 sm:max-w-2xl"}
            zIndex={30}
          >
            <HeadingWithAction>
              <H3>{modalTitle}</H3>
              <ModalCloseButton onClose={closeModal} />
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
                returnPath={backgroundHref}
                editLink={
                  upload && !isDeletedUploadMarker(upload)
                    ? {
                        to: "/$projectSlug/uploads/$uploadId/edit",
                        params: { projectSlug, uploadId: String(upload.id) },
                        search: { returnTo: backgroundHref },
                      }
                    : undefined
                }
                editHref={
                  upload && !isDeletedUploadMarker(upload)
                    ? buildUploadModalHref({
                        uploadId: upload.id,
                        view: "edit",
                      })
                    : undefined
                }
                onClose={closeModal}
                onDeleted={async () => {
                  closeModal()
                }}
                onEditSuccess={async () => {
                  openUploadDetail({ uploadId: modalUploadId })
                }}
                onDirtyChange={setIsDirty}
                onSubmittingChange={setIsSubmitting}
              />
            )}
          </Modal>
        ) : null}
      </>
    </ProjectUploadModalContext.Provider>
  )
}

export function ProjectUploadModalHostProvider({ children }: { children: React.ReactNode }) {
  return <ProjectUploadModalHostInner>{children}</ProjectUploadModalHostInner>
}

export function useProjectUploadModal() {
  return useContext(ProjectUploadModalContext)
}
