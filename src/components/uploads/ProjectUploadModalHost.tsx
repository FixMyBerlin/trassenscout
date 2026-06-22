import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Spinner } from "@/src/components/core/components/Spinner"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useLocation, useRouter, useSearch } from "@tanstack/react-router"
import { createContext, Suspense, useContext, useState } from "react"
import { acquisitionAreasQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import type { Upload } from "@/src/prisma/generated/browser"
import { clearProjectUploadModalSearch } from "@/src/shared/uploads/searchSchemas"
import { EditUploadForm } from "./EditUploadForm"
import { UploadDetailPanelContent } from "./UploadDetailPanelContent"
import { isDeletedUploadMarker } from "./uploadTypes"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type PreviewUpload = Pick<Upload, "id" | "title" | "mimeType" | "externalUrl" | "collaborationUrl">

type ProjectUploadModalContextValue = {
  openUploadDetail: (input: { uploadId: number; previewUpload?: PreviewUpload }) => void
  openUploadEdit: (input: { uploadId: number }) => void
}

const ProjectUploadModalContext = createContext<ProjectUploadModalContextValue | null>(null)

function UploadEditModalContent({
  uploadId,
  returnPath,
  onClose,
  onSuccess,
  setIsDirty,
  setIsSubmitting,
}: {
  uploadId: number
  returnPath: string
  onClose: () => void
  onSuccess: () => void
  setIsDirty: (dirty: boolean) => void
  setIsSubmitting: (submitting: boolean) => void
}) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: upload } = useQuery(uploadQueryOptions({ projectSlug, id: uploadId }))

  if (!upload || isDeletedUploadMarker(upload)) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Dieses Dokument ist nicht mehr verfügbar oder wird noch geladen.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Schließen
        </button>
      </div>
    )
  }

  return (
    <EditUploadForm
      upload={upload}
      returnPath={returnPath}
      returnText="Zurück"
      onSuccess={async () => {
        setIsDirty(false)
        setIsSubmitting(false)
        onSuccess()
      }}
      onDirtyChange={setIsDirty}
      onSubmittingChange={setIsSubmitting}
      showDelete={false}
      hideBackLink
    />
  )
}

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
  const modalUploadId = modalSearch.modalUploadId
  const modalUploadView = modalSearch.modalUploadView
  const [previewUpload, setPreviewUpload] = useState<PreviewUpload | undefined>(undefined)
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
              ...currentSearch,
              modalUploadId: uploadId,
              modalUploadView: view,
            }
          : clearProjectUploadModalSearch(currentSearch),
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
    search: clearProjectUploadModalSearch(currentSearch),
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
  }

  const { data: upload } = useQuery({
    ...uploadQueryOptions({ projectSlug, id: modalUploadId ?? 0 }),
    enabled: modalUploadId !== undefined,
  })

  const isOpen = modalUploadId !== undefined && modalUploadView !== undefined
  const isEditView = modalUploadView === "edit"
  const modalTitle = isEditView
    ? "Dokument bearbeiten"
    : upload && !isDeletedUploadMarker(upload)
      ? upload.title
      : previewUpload?.title ?? "Dokument wird geladen …"

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

            {isEditView && modalUploadId !== undefined ? (
              <Suspense fallback={<Spinner />}>
                <UploadEditModalContent
                  uploadId={modalUploadId}
                  returnPath={backgroundHref}
                  onClose={closeModal}
                  onSuccess={() => openUploadDetail({ uploadId: modalUploadId })}
                  setIsDirty={setIsDirty}
                  setIsSubmitting={setIsSubmitting}
                />
              </Suspense>
            ) : upload && isDeletedUploadMarker(upload) ? (
              <p className="text-sm text-gray-600">Dieses Dokument wurde gelöscht.</p>
            ) : upload ? (
              <UploadDetailPanelContent
                upload={upload}
                projectSlug={projectSlug}
                editLink={{
                  to: "/$projectSlug/uploads/$uploadId/edit",
                  params: { projectSlug, uploadId: String(upload.id) },
                  search: { returnTo: backgroundHref },
                }}
                onEditClick={(event) => {
                  event.preventDefault()
                  openUploadEdit({ uploadId: upload.id })
                }}
                onDeleted={async () => {
                  closeModal()
                }}
              />
            ) : (
              <Spinner />
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
