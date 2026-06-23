import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useLocation, useRouter, useSearch } from "@tanstack/react-router"
import { createContext, useContext, useEffect, useState } from "react"
import { Link } from "@/src/components/core/components/links/Link"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { Spinner } from "@/src/components/core/components/Spinner"
import { H3 } from "@/src/components/core/components/text/Headings"
import { HeadingWithAction } from "@/src/components/core/components/text/HeadingWithAction"
import { EditProjectRecordForm } from "@/src/components/project-records/EditProjectRecordForm"
import { ProjectRecordDetailClient } from "@/src/components/project-records/ProjectRecordDetailClient"
import { getProjectRecordEditSuccessNavigateOptions } from "@/src/components/project-records/utils/getProjectRecordEditSuccessRoute"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { clearProjectRecordModalSearch } from "@/src/shared/projectRecords/searchSchemas"
import { clearProjectUploadModalSearch } from "@/src/shared/uploads/searchSchemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type PreviewProjectRecord = {
  id: number
  title: string
}

type ProjectRecordModalContextValue = {
  openProjectRecordDetail: (input: {
    projectRecordId: number
    previewProjectRecord?: PreviewProjectRecord
  }) => void
  openProjectRecordEdit: (input: { projectRecordId: number }) => void
  getProjectRecordDetailHref: (input: { projectRecordId: number }) => string
}

const ProjectRecordModalContext = createContext<ProjectRecordModalContextValue | null>(null)

function ProjectRecordModalHostInner({ children }: { children: React.ReactNode }) {
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
  const userCanEdit = useUserCan().edit
  const currentSearch = activeSearch ?? {}
  const backgroundSearch = clearProjectUploadModalSearch(
    clearProjectRecordModalSearch(currentSearch),
  )
  const modalProjectRecordId = modalSearch.modalProjectRecordId
  const modalProjectRecordView = modalSearch.modalProjectRecordView
  const [previewProjectRecord, setPreviewProjectRecord] = useState<
    PreviewProjectRecord | undefined
  >(undefined)
  const [isDirty, setIsDirty] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildProjectRecordModalHref = ({
    projectRecordId,
    view,
  }: {
    projectRecordId: number
    view: "detail" | "edit"
  }) =>
    router.buildLocation({
      to: location.pathname,
      search: {
        ...backgroundSearch,
        modalProjectRecordId: projectRecordId,
        modalProjectRecordView: view,
      },
    }).href

  const updateModalState = async ({
    replace = false,
    projectRecordId,
    view,
  }: {
    projectRecordId?: number
    view?: "detail" | "edit"
    replace?: boolean
  }) => {
    await navigate({
      to: location.pathname,
      search:
        projectRecordId && view
          ? {
              ...backgroundSearch,
              modalProjectRecordId: projectRecordId,
              modalProjectRecordView: view,
            }
          : backgroundSearch,
      replace,
      resetScroll: false,
    })
  }

  useEffect(() => {
    if (modalProjectRecordView === "edit" && !userCanEdit) {
      void updateModalState({ replace: true })
    }
  }, [backgroundSearch, location.pathname, modalProjectRecordView, navigate, userCanEdit])

  const closeModal = () => {
    if (isEditView && isSubmitting) return
    if (isEditView && isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return

    setIsDirty(false)
    setIsSubmitting(false)
    setPreviewProjectRecord(undefined)

    void updateModalState({ replace: true })
  }

  const openProjectRecordDetail = (input: {
    projectRecordId: number
    previewProjectRecord?: PreviewProjectRecord
  }) => {
    setPreviewProjectRecord(input.previewProjectRecord)
    setIsDirty(false)
    setIsSubmitting(false)
    void queryClient.ensureQueryData(
      projectRecordQueryOptions({ projectSlug, id: input.projectRecordId }),
    )
    void updateModalState({
      projectRecordId: input.projectRecordId,
      view: "detail",
      replace: modalProjectRecordId === input.projectRecordId,
    })
  }

  const openProjectRecordEdit = (input: { projectRecordId: number }) => {
    if (!userCanEdit) return

    setIsDirty(false)
    setIsSubmitting(false)
    void queryClient.ensureQueryData(
      projectRecordQueryOptions({ projectSlug, id: input.projectRecordId }),
    )
    void updateModalState({
      projectRecordId: input.projectRecordId,
      view: "edit",
      replace: modalProjectRecordId === input.projectRecordId && modalProjectRecordView === "edit",
    })
  }

  const contextValue: ProjectRecordModalContextValue = {
    openProjectRecordDetail,
    openProjectRecordEdit,
    getProjectRecordDetailHref: ({ projectRecordId }) =>
      buildProjectRecordModalHref({ projectRecordId, view: "detail" }),
  }

  const projectRecordQuery = useQuery({
    ...projectRecordQueryOptions({ projectSlug, id: modalProjectRecordId ?? 0 }),
    enabled: modalProjectRecordId !== undefined,
  })
  const projectRecord = projectRecordQuery.data

  const isEditView = modalProjectRecordView === "edit"
  const isOpen =
    modalProjectRecordId !== undefined &&
    modalProjectRecordView !== undefined &&
    (modalProjectRecordView !== "edit" || userCanEdit)
  const hasProjectRecordError = Boolean(projectRecordQuery.error)
  const isProjectRecordUnavailable = !projectRecordQuery.isPending && !projectRecord
  const modalTitle = isEditView
    ? "Protokolleintrag bearbeiten"
    : hasProjectRecordError || isProjectRecordUnavailable
      ? "Protokolleintrag"
      : (projectRecord?.title ?? previewProjectRecord?.title ?? "Protokolleintrag wird geladen …")

  return (
    <ProjectRecordModalContext.Provider value={contextValue}>
      <>
        {children}
        {isOpen ? (
          <Modal open handleClose={closeModal} align="right" className="space-y-4" zIndex={30}>
            <HeadingWithAction>
              <H3>{modalTitle}</H3>
              <div className="flex items-center gap-4">
                {!isEditView && projectRecord ? (
                  <IfUserCanEdit>
                    <Link
                      icon="edit"
                      to={buildProjectRecordModalHref({
                        projectRecordId: projectRecord.id,
                        view: "edit",
                      })}
                      resetScroll={false}
                    >
                      Bearbeiten
                    </Link>
                  </IfUserCanEdit>
                ) : null}
                <ModalCloseButton onClose={closeModal} />
              </div>
            </HeadingWithAction>

            {isEditView && projectRecord ? (
              <EditProjectRecordForm
                projectRecord={projectRecord}
                hideBackLink
                onDirtyChange={setIsDirty}
                onSubmittingChange={setIsSubmitting}
                onSuccess={(reviewState) => {
                  setIsDirty(false)
                  setIsSubmitting(false)

                  const nextRoute = getProjectRecordEditSuccessNavigateOptions({
                    projectSlug,
                    projectRecordId: projectRecord.id,
                    initialReviewState: projectRecord.reviewState,
                    nextReviewState: reviewState,
                  })

                  if (nextRoute.to === "/$projectSlug/project-records/$projectRecordId") {
                    openProjectRecordDetail({
                      projectRecordId: projectRecord.id,
                      previewProjectRecord: {
                        id: projectRecord.id,
                        title: projectRecord.title,
                      },
                    })
                    return
                  }

                  void navigate({
                    ...nextRoute,
                    replace: true,
                    resetScroll: false,
                  })
                }}
              />
            ) : projectRecord ? (
              <ProjectRecordDetailClient initialProjectRecord={projectRecord} />
            ) : hasProjectRecordError ? (
              <Notice type="error" title="Der Protokolleintrag konnte nicht geladen werden.">
                <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
              </Notice>
            ) : isProjectRecordUnavailable ? (
              <Notice type="warn" title="Dieser Protokolleintrag ist nicht mehr verfügbar.">
                <p>Er wurde möglicherweise gelöscht oder ist für Sie nicht mehr zugänglich.</p>
              </Notice>
            ) : (
              <Spinner />
            )}
          </Modal>
        ) : null}
      </>
    </ProjectRecordModalContext.Provider>
  )
}

export function ProjectRecordModalHostProvider({ children }: { children: React.ReactNode }) {
  return <ProjectRecordModalHostInner>{children}</ProjectRecordModalHostInner>
}

export function useProjectRecordModal() {
  return useContext(ProjectRecordModalContext)
}
