import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useLocation } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { ContactDeleteActionBar } from "@/src/components/contacts/ContactDeleteActionBar"
import { ContactSingle } from "@/src/components/contacts/ContactSingle"
import { useContactsModal } from "@/src/components/contacts/ContactsModalHost"
import { EditContactForm } from "@/src/components/contacts/EditContactForm"
import { NewContactForm } from "@/src/components/contacts/NewContactForm"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { getFullname } from "@/src/components/core/users/getFullname"
import { MultiProjectInviteForm } from "@/src/components/invites/MultiProjectInviteForm"
import { EditProjectRecordForm } from "@/src/components/project-records/EditProjectRecordForm"
import { ProjectRecordDetailClient } from "@/src/components/project-records/ProjectRecordDetailClient"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { getProjectRecordEditSuccessNavigateOptions } from "@/src/components/project-records/utils/getProjectRecordEditSuccessRoute"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { useProjectModalNavigation } from "@/src/components/shared/projectModals/useProjectModalNavigation"
import { useProjectUploadModal } from "@/src/components/uploads/ProjectUploadModalHost"
import { UploadModalContent } from "@/src/components/uploads/UploadModalContent"
import { isDeletedUploadMarker } from "@/src/components/uploads/uploadTypes"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { getProjectModalPreview } from "@/src/shared/projectModals/historyState"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")
const MODAL_CLOSE_ANIMATION_MS = 200

export function ProjectModalHost() {
  const navigate = loggedInProjectRouteApi.useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const modalSearch = loggedInProjectRouteApi.useSearch()
  const location = useLocation()
  const userCanEdit = useUserCan().edit
  const contactsModal = useContactsModal()
  const projectRecordModal = useProjectRecordModal()
  const projectUploadModal = useProjectUploadModal()
  const { backgroundHref, buildModalHref, updateModalSearch } = useProjectModalNavigation()
  const preview = getProjectModalPreview(location.state)
  const closeTimeoutRef = useRef<number | undefined>(undefined)
  const [modalFormState, setModalFormState] = useState({
    modalKey: "",
    isDirty: false,
    isSubmitting: false,
  })
  const [closingModalKey, setClosingModalKey] = useState<string | undefined>(undefined)

  const {
    modalUploadId,
    modalUploadView,
    modalProjectRecordId,
    modalProjectRecordView,
    modalContactId,
    modalContactView,
    modalInviteView,
  } = modalSearch

  const activeModalKey = [
    modalUploadId,
    modalUploadView,
    modalProjectRecordId,
    modalProjectRecordView,
    modalContactId,
    modalContactView,
    modalInviteView,
  ].join(":")

  const isDirty = modalFormState.modalKey === activeModalKey ? modalFormState.isDirty : false
  const isSubmitting =
    modalFormState.modalKey === activeModalKey ? modalFormState.isSubmitting : false
  const isClosing = closingModalKey === activeModalKey

  const setActiveModalDirty = (isDirty: boolean) => {
    setModalFormState((previousState) => ({
      modalKey: activeModalKey,
      isDirty,
      isSubmitting: previousState.modalKey === activeModalKey ? previousState.isSubmitting : false,
    }))
  }

  const setActiveModalSubmitting = (isSubmitting: boolean) => {
    setModalFormState((previousState) => ({
      modalKey: activeModalKey,
      isDirty: previousState.modalKey === activeModalKey ? previousState.isDirty : false,
      isSubmitting,
    }))
  }

  const resetActiveModalFormState = () => {
    setModalFormState({
      modalKey: activeModalKey,
      isDirty: false,
      isSubmitting: false,
    })
  }

  useEffect(function clearPendingProjectModalCloseTimerOnUnmount() {
    return function clearPendingProjectModalCloseTimer() {
      if (closeTimeoutRef.current === undefined) return
      window.clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  useEffect(
    function closeEditorOnlyProjectModalViewsWhenUserCannotEdit() {
      const requiresEditPermission =
        modalProjectRecordView === "edit" ||
        modalContactView === "edit" ||
        modalContactView === "new" ||
        modalInviteView === "new"
      if (!requiresEditPermission || userCanEdit) return

      void updateModalSearch(undefined, { replace: true })
    },
    [modalContactView, modalInviteView, modalProjectRecordView, updateModalSearch, userCanEdit],
  )

  const isProjectRecordEditView = modalProjectRecordView === "edit"
  const isUploadEditView = modalUploadView === "edit"

  const closeModal = () => {
    if (isClosing) return
    if ((isProjectRecordEditView || isUploadEditView) && isSubmitting) return
    if (
      (isProjectRecordEditView || isUploadEditView) &&
      isDirty &&
      !window.confirm("Ungespeicherte Änderungen verwerfen?")
    ) {
      return
    }

    resetActiveModalFormState()
    setClosingModalKey(activeModalKey)
    closeTimeoutRef.current = window.setTimeout(() => {
      setClosingModalKey(undefined)
      closeTimeoutRef.current = undefined
      void updateModalSearch(undefined, { replace: true })
    }, MODAL_CLOSE_ANIMATION_MS)
  }

  const uploadQuery = useQuery({
    ...uploadQueryOptions({ projectSlug, id: modalUploadId ?? 0 }),
    enabled: modalUploadId !== undefined,
  })
  const upload = uploadQuery.data

  const projectRecordQuery = useQuery({
    ...projectRecordQueryOptions({ projectSlug, id: modalProjectRecordId ?? 0 }),
    enabled: modalProjectRecordId !== undefined,
  })
  const projectRecord = projectRecordQuery.data

  const contactQuery = useQuery({
    ...contactQueryOptions({ projectSlug, id: modalContactId ?? 0 }),
    enabled:
      modalContactId !== undefined && modalContactView !== undefined && modalContactView !== "new",
  })
  const contact = contactQuery.data

  if (modalUploadId !== undefined && modalUploadView !== undefined) {
    const hasUploadError = Boolean(uploadQuery.error)
    const isUploadUnavailable = !uploadQuery.isPending && !upload
    const previewUpload = preview?.type === "upload" ? preview.upload : undefined
    const modalTitle = isUploadEditView
      ? "Dokument bearbeiten"
      : hasUploadError || isUploadUnavailable
        ? "Dokument"
        : upload && !isDeletedUploadMarker(upload)
          ? upload.title
          : (previewUpload?.title ?? "Dokument wird geladen …")

    const uploadEditHref =
      upload && !isDeletedUploadMarker(upload)
        ? buildModalHref({
            modalUploadId: upload.id,
            modalUploadView: "edit",
          })
        : undefined

    return (
      <Modal
        open
        handleClose={closeModal}
        align={isUploadEditView ? "right" : "center"}
        className={isUploadEditView ? undefined : "sm:max-w-2xl"}
      >
        <PageHeader
          title={modalTitle}
          action={
            <div className="flex items-center gap-4">
              {!isUploadEditView && uploadEditHref ? (
                <IfUserCanEdit>
                  <Link icon="edit" to={uploadEditHref} resetScroll={false}>
                    Bearbeiten
                  </Link>
                </IfUserCanEdit>
              ) : null}
              <ModalCloseButton onClose={closeModal} />
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
            isEditView={isUploadEditView}
            returnPath={backgroundHref}
            onClose={closeModal}
            onEditSuccess={async () => {
              projectUploadModal.openUploadDetail({ uploadId: modalUploadId })
            }}
            onDirtyChange={setActiveModalDirty}
            onSubmittingChange={setActiveModalSubmitting}
          />
        )}
      </Modal>
    )
  }

  if (modalProjectRecordId !== undefined && modalProjectRecordView !== undefined) {
    const isOpen = modalProjectRecordView !== "edit" || userCanEdit
    if (!isOpen) return null

    const hasProjectRecordError = Boolean(projectRecordQuery.error)
    const isProjectRecordUnavailable = !projectRecordQuery.isPending && !projectRecord
    const previewProjectRecord =
      preview?.type === "projectRecord" ? preview.projectRecord : undefined
    const modalTitle = isProjectRecordEditView
      ? "Protokolleintrag bearbeiten"
      : hasProjectRecordError || isProjectRecordUnavailable
        ? "Protokolleintrag"
        : (projectRecord?.title ?? previewProjectRecord?.title ?? "Protokolleintrag wird geladen …")

    return (
      <Modal open handleClose={closeModal} align="right">
        <PageHeader
          title={modalTitle}
          action={
            <div className="flex items-center gap-4">
              {!isProjectRecordEditView && projectRecord ? (
                <IfUserCanEdit>
                  <Link
                    icon="edit"
                    to={buildModalHref({
                      modalProjectRecordId: projectRecord.id,
                      modalProjectRecordView: "edit",
                    })}
                    resetScroll={false}
                  >
                    Bearbeiten
                  </Link>
                </IfUserCanEdit>
              ) : null}
              <ModalCloseButton onClose={closeModal} />
            </div>
          }
        />

        {isProjectRecordEditView && projectRecord ? (
          <EditProjectRecordForm
            projectRecord={projectRecord}
            hideBackLink
            onDirtyChange={setActiveModalDirty}
            onSubmittingChange={setActiveModalSubmitting}
            onSuccess={(reviewState) => {
              resetActiveModalFormState()

              const nextRoute = getProjectRecordEditSuccessNavigateOptions({
                projectSlug,
                projectRecordId: projectRecord.id,
                initialReviewState: projectRecord.reviewState,
                nextReviewState: reviewState,
              })

              if (nextRoute.to === "/$projectSlug/project-records/$projectRecordId") {
                projectRecordModal.openProjectRecordDetail({
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
          <ProjectRecordDetailClient
            initialProjectRecord={projectRecord}
            needsReviewEditHref={
              userCanEdit
                ? buildModalHref({
                    modalProjectRecordId: projectRecord.id,
                    modalProjectRecordView: "edit",
                  })
                : undefined
            }
          />
        ) : hasProjectRecordError ? (
          <div className={pageContentPaddingClassName}>
            <Notice type="error" title="Der Protokolleintrag konnte nicht geladen werden.">
              <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
            </Notice>
          </div>
        ) : isProjectRecordUnavailable ? (
          <div className={pageContentPaddingClassName}>
            <Notice type="warn" title="Dieser Protokolleintrag ist nicht mehr verfügbar.">
              <p>Er wurde möglicherweise gelöscht oder ist für Sie nicht mehr zugänglich.</p>
            </Notice>
          </div>
        ) : (
          <div className={pageContentPaddingClassName}>
            <Spinner />
          </div>
        )}
      </Modal>
    )
  }

  if (modalContactView !== undefined || modalInviteView !== undefined) {
    const isContactDetailView = modalContactView === "detail"
    const isContactEditView = modalContactView === "edit"
    const isContactNewView = modalContactView === "new"
    const isInviteNewView = modalInviteView === "new"
    const isEditorOnlyView = isContactEditView || isContactNewView || isInviteNewView
    const isOpen = !isEditorOnlyView || userCanEdit
    if (!isOpen) return null

    const hasContactError = Boolean(contactQuery.error)
    const isContactUnavailable = !contactQuery.isPending && !contact && !isContactNewView
    const previewContact = preview?.type === "contact" ? preview.contact : undefined
    const modalAlign = isContactDetailView || isInviteNewView ? "center" : "right"
    const modalClassName = isContactDetailView
      ? "sm:max-w-2xl"
      : isInviteNewView
        ? "space-y-4 sm:max-w-4xl"
        : "space-y-4"
    const modalTitle = isContactEditView
      ? "Kontakt bearbeiten"
      : isContactNewView
        ? "Neuen Kontakt anlegen"
        : isInviteNewView
          ? "Teammitglied einladen"
          : hasContactError || isContactUnavailable
            ? "Kontakt"
            : contact
              ? getFullname(contact) || "Kontakt"
              : previewContact
                ? getFullname(previewContact) || "Kontakt"
                : "Kontakt wird geladen …"

    return (
      <Modal open handleClose={closeModal} align={modalAlign} className={modalClassName}>
        <PageHeader title={modalTitle} action={<ModalCloseButton onClose={closeModal} />} />

        {isContactNewView ? (
          <NewContactForm
            projectSlug={projectSlug}
            layout="drawer"
            onSuccess={(createdContact) => {
              contactsModal.openContactDetail({
                contactId: createdContact.id,
                previewContact: createdContact,
              })
            }}
          />
        ) : isInviteNewView ? (
          <MultiProjectInviteForm
            projectSlug={projectSlug}
            onSuccess={() => {
              closeModal()
            }}
          />
        ) : isContactEditView && contact ? (
          <EditContactForm
            contact={contact}
            projectSlug={projectSlug}
            hideBackLink
            hideSuperAdminLogData
            layout="drawer"
            returnPath={backgroundHref}
            onSuccess={(updatedContact) => {
              contactsModal.openContactDetail({
                contactId: updatedContact.id,
                previewContact: updatedContact,
              })
            }}
          />
        ) : contact ? (
          <div className={pageContentPaddingClassName}>
            <ContactSingle contact={contact} />
            <IfUserCanEdit>
              <ButtonWrapper className="border-t border-gray-200 pt-4">
                <Link
                  button="blue"
                  to={buildModalHref({
                    modalContactId: contact.id,
                    modalContactView: "edit",
                  })}
                  resetScroll={false}
                >
                  Bearbeiten
                </Link>
                <ContactDeleteActionBar
                  contactId={contact.id}
                  projectSlug={projectSlug}
                  contactTitle={getFullname(contact) || "Kontakt"}
                  returnPath={backgroundHref}
                  variant="linkWithIcon"
                />
              </ButtonWrapper>
            </IfUserCanEdit>
          </div>
        ) : hasContactError ? (
          <div className={pageContentPaddingClassName}>
            <Notice type="error" title="Der Kontakt konnte nicht geladen werden.">
              <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
            </Notice>
          </div>
        ) : isContactUnavailable ? (
          <div className={pageContentPaddingClassName}>
            <Notice type="warn" title="Dieser Kontakt ist nicht mehr verfügbar.">
              <p>Er wurde möglicherweise gelöscht oder ist für Sie nicht mehr zugänglich.</p>
            </Notice>
          </div>
        ) : (
          <div className={pageContentPaddingClassName}>
            <Spinner />
          </div>
        )}
      </Modal>
    )
  }

  return null
}
