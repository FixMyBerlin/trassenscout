import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
import { twJoin } from "tailwind-merge"
import { z } from "zod"
import { primaryButtonSmClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Modal, ModalCloseButton } from "@/src/components/core/components/Modal"
import { FormModal } from "@/src/components/core/components/Modal/FormModal"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { ProjectRecordEmailBody } from "@/src/components/project-records/ProjectRecordEmailSource"
import { useProjectRecordModal } from "@/src/components/project-records/ProjectRecordModalHost"
import { ProjectRecordCreateForm } from "@/src/components/project-records/ProjectRecordNewModal"
import { invalidateAfterProjectRecordChange } from "@/src/components/project-records/projectRecordQueryCache"
import {
  projectRecordSectionClassName,
  projectRecordSectionLabelClassName,
  projectRecordSectionValueClassName,
} from "@/src/components/project-records/ProjectRecordSummary"
import { ProjectRecordTemplatePickerModal } from "@/src/components/project-records/ProjectRecordTemplatePickerModal"
import { formatEmailAddresses } from "@/src/components/project-records/utils/formatEmailAddresses"
import { isAdmin } from "@/src/components/shared/app/users/utils/isAdmin"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import {
  createProjectRecordFromEmailFn,
  discardProjectRecordEmailFn,
  draftProjectRecordFromEmailFn,
} from "@/src/server/projectRecordEmails/projectRecordEmailInbox.functions"
import { projectRecordEmailInboxItemQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailInboxQueryOptions"
import type { ProjectRecordTemplateOption } from "@/src/server/projectRecordTemplates/types"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { NewProjectRecordFormSchema } from "@/src/shared/projectRecords/schemas"

type Props = {
  projectSlug: string
  projectRecordEmailId: number
  onClose: () => void
}

type Draft = Awaited<ReturnType<typeof draftProjectRecordFromEmailFn>>

const invalidateInbox = (queryClient: QueryClient) =>
  Promise.all(
    ["projectRecordEmailInbox", "projectRecordEmailInboxItem", "projectRecordsTabCounts"].map(
      (key) => queryClient.invalidateQueries({ queryKey: [key] }),
    ),
  )

const formatMailTime = (date: Date) => formatBerlinTime(date, "dd.MM.yyyy, HH:mm")

const EmailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={projectRecordSectionClassName}>
    <p className={projectRecordSectionLabelClassName}>{label}</p>
    <p className={twJoin(projectRecordSectionValueClassName, "wrap-anywhere")}>{children}</p>
  </div>
)

// Admins on KI projects: read the mail, let the KI draft an entry from a Vorlage, check and save it.
export function ProjectRecordInboxEmailModal({
  projectSlug,
  projectRecordEmailId,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const { openProjectRecordDetail, getProjectRecordDetailHref } = useProjectRecordModal()
  const { data: user } = useQuery(currentUserQueryOptions())
  const { data: project } = useQuery(projectBySlugQueryOptions(projectSlug))
  // Same gate as the Posteingang route.
  const canUseInbox = isAdmin(user ?? null) && Boolean(project?.aiEnabled)
  const emailQuery = useQuery({
    ...projectRecordEmailInboxItemQueryOptions({ projectSlug, projectRecordEmailId }),
    enabled: canUseInbox,
  })
  const email = emailQuery.data
  const uploadIds = email?.uploads.map((upload) => upload.id) ?? []
  const { data: uploadsData } = useQuery({
    ...uploadsWithSubsectionsQueryOptions({ projectSlug, uploadIds }),
    enabled: uploadIds.length > 0,
    placeholderData: keepPreviousData,
  })
  const draftMutation = useMutation({ mutationFn: draftProjectRecordFromEmailFn })
  const createMutation = useMutation({ mutationFn: createProjectRecordFromEmailFn })
  const discardMutation = useMutation({ mutationFn: discardProjectRecordEmailFn })
  const [step, setStep] = useState<"email" | "picker" | "form">("email")
  const [isSwitchingStep, setIsSwitchingStep] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!canUseInbox) return null

  const isInInbox = email ? email.projectRecords.length === 0 && !email.discardedAt : false
  // A mail processed or discarded elsewhere falls back to the mail view and its notice.
  const activeStep = isInInbox || isSaving ? step : "email"
  const isDiscarding = discardMutation.isPending || discardMutation.isSuccess
  const modalTitle = email
    ? email.subject || "(kein Betreff)"
    : emailQuery.error
      ? "E-Mail"
      : "E-Mail wird geladen …"
  const emailUploads = (uploadsData?.uploads ?? []).filter((upload) =>
    uploadIds.includes(upload.id),
  )

  const closeEmail = () => {
    if (isDiscarding) return
    onClose()
  }

  const openPicker = () => {
    draftMutation.reset()
    setStep("picker")
  }

  const closePicker = () => {
    // A KI result that arrives after closing must not open the form.
    draftMutation.reset()
    setStep("email")
  }

  const switchToForm = (nextDraft: Draft) => {
    setDraft(nextDraft)
    // As in ProjectRecordNewModal: both modals stay open for a frame while they swap.
    setIsSwitchingStep(true)
    setStep("form")
    requestAnimationFrame(() => setIsSwitchingStep(false))
  }

  const startDraft = (template: ProjectRecordTemplateOption | null) => {
    draftMutation.mutate(
      {
        data: {
          projectSlug,
          projectRecordEmailId,
          projectRecordTemplateId: template?.id ?? null,
        },
      },
      { onSuccess: switchToForm },
    )
  }

  const closeForm = () => {
    if (isSaving) return
    if (!window.confirm("Entwurf verwerfen? Die E-Mail bleibt im Posteingang.")) return
    onClose()
  }

  const handleSubmit = async (values: z.infer<typeof NewProjectRecordFormSchema>) => {
    setIsSaving(true)
    try {
      const projectRecord = await createMutation.mutateAsync({
        data: { ...values, projectSlug, projectRecordEmailId },
      })
      // Waits for the record detail, so the form never resets in view.
      await openProjectRecordDetail({
        projectRecordId: projectRecord.id,
        previewProjectRecord: { id: projectRecord.id, title: projectRecord.title },
      })
      void invalidateInbox(queryClient)
      void invalidateAfterProjectRecordChange(queryClient, projectSlug)
    } catch (error: unknown) {
      setIsSaving(false)
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  const handleDiscard = async () => {
    if (!window.confirm("E-Mail verwerfen? Sie erscheint dann nicht mehr im Posteingang.")) return
    try {
      await discardMutation.mutateAsync({ data: { projectSlug, projectRecordEmailId } })
    } catch (error) {
      console.error("Error discarding mail:", error)
      alert("Beim Verwerfen ist ein Fehler aufgetreten.")
      return
    }
    onClose()
    void invalidateInbox(queryClient)
  }

  return (
    <>
      <Modal open={activeStep !== "form" || isSwitchingStep} handleClose={closeEmail} align="right">
        <PageHeader
          title={modalTitle}
          action={
            <div className="flex items-center gap-4">
              {isInInbox && (
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={isDiscarding}
                  className={primaryButtonSmClassName}
                >
                  E-Mail verarbeiten
                </button>
              )}
              <ModalCloseButton onClose={closeEmail} />
            </div>
          }
        />

        {email ? (
          <>
            <div className={twJoin(pageContentPaddingClassName, "my-6 space-y-6")}>
              <div className="empty:hidden">
                {!email.isSenderKnown && (
                  <Notice type="warn" title="Unbekannter Absender">
                    <p>Die Absenderadresse gehört zu keinem Teammitglied dieses Projekts.</p>
                  </Notice>
                )}
                {email.skippedAttachments.length > 0 && (
                  <Notice type="warn" title="Nicht übernommene Anhänge">
                    <p>
                      {email.skippedAttachments.join(", ")} (zu groß oder Fehler beim Hochladen)
                    </p>
                  </Notice>
                )}
                {email.projectRecords.map((projectRecord) => (
                  <Notice
                    key={projectRecord.id}
                    type="info"
                    title="Diese E-Mail ist bereits verarbeitet."
                  >
                    <p>
                      Protokolleintrag:{" "}
                      <Link
                        to={getProjectRecordDetailHref({ projectRecordId: projectRecord.id })}
                        resetScroll={false}
                      >
                        {projectRecord.title}
                      </Link>
                    </p>
                  </Notice>
                ))}
                {email.discardedAt && (
                  <Notice
                    type="info"
                    title={`Diese E-Mail wurde am ${formatMailTime(email.discardedAt)} verworfen.`}
                  />
                )}
              </div>

              <EmailRow label="Von:">
                {email.from ? formatEmailAddresses(email.from) : "Unbekannt"}
              </EmailRow>
              {email.to && <EmailRow label="An:">{formatEmailAddresses(email.to)}</EmailRow>}
              {email.cc && <EmailRow label="Cc:">{formatEmailAddresses(email.cc)}</EmailRow>}
              <EmailRow label="Datum:">{formatMailTime(email.date ?? email.createdAt)}</EmailRow>

              {email.textBody && (
                <section className="rounded-md bg-blue-50 p-4">
                  <ProjectRecordEmailBody text={email.textBody} className="text-sm text-gray-700" />
                </section>
              )}

              <div>
                <p className={twJoin(projectRecordSectionLabelClassName, "mb-2")}>Anhänge:</p>
                {email.uploads.length === 0 ? (
                  <span className="text-sm text-gray-500">Keine Anhänge</span>
                ) : emailUploads.length > 0 ? (
                  <UploadTable
                    projectSlug={projectSlug}
                    withAction={false}
                    withRelations={false}
                    uploads={emailUploads}
                  />
                ) : (
                  // The mail's own list while the table loads or cannot show them.
                  <ul className="list-disc pl-4 text-sm text-gray-700">
                    {email.uploads.map((upload) => (
                      <li key={upload.id}>{upload.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {isInInbox && (
              <div className={twJoin("border-t border-gray-200", pageContentPaddingClassName)}>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isDiscarding}
                  className={twJoin("inline-flex cursor-pointer items-center gap-1", linkStyles)}
                >
                  {linkIcons["delete"]}
                  E-Mail verwerfen
                </button>
              </div>
            )}
          </>
        ) : emailQuery.error ? (
          <div className={pageContentPaddingClassName}>
            <Notice type="error" title="Die E-Mail konnte nicht geladen werden.">
              <p>Bitte versuchen Sie es erneut oder schließen Sie dieses Fenster.</p>
            </Notice>
          </div>
        ) : (
          <div className={pageContentPaddingClassName}>
            <Spinner />
          </div>
        )}

        <ProjectRecordTemplatePickerModal
          projectSlug={projectSlug}
          open={activeStep === "picker"}
          onClose={closePicker}
          onSelect={startDraft}
          intro="Möchten Sie eine Vorlage nutzen oder ohne Vorlage starten? Die KI füllt den Protokolleintrag anhand der E-Mail aus, das dauert etwa eine halbe Minute. Danach können Sie den Entwurf prüfen und speichern."
          pendingTemplateId={
            draftMutation.isPending
              ? draftMutation.variables.data.projectRecordTemplateId
              : undefined
          }
        >
          {draftMutation.error && (
            <div role="alert">
              <Notice type="error" title="Die KI-Verarbeitung ist fehlgeschlagen.">
                <p>{translateServerError(draftMutation.error.message)}</p>
              </Notice>
            </div>
          )}
        </ProjectRecordTemplatePickerModal>
      </Modal>

      <FormModal
        open={activeStep === "form"}
        title="Neuer Protokolleintrag"
        onClose={closeForm}
        align="right"
      >
        {draft && email && (
          <ProjectRecordCreateForm
            formKey={`inbox-${projectRecordEmailId}`}
            formInitialValues={{
              title: draft.title,
              body: draft.body,
              date: draft.date ?? "",
              tags: draft.tags.map(String),
              uploads: draft.uploads.map(String),
              formTemplates: draft.formTemplates.map(String),
              projectRecordTemplateId: draft.projectRecordTemplateId,
            }}
            projectSlug={projectSlug}
            createRelationContext="project"
            landAcquisitionModuleEnabled={project?.landAcquisitionModuleEnabled ?? false}
            onSubmit={handleSubmit}
            emailSource={{
              from: email.from,
              subject: email.subject,
              date: email.date,
              textBody: email.textBody,
              uploads: email.uploads,
            }}
            submitText="Als Protokolleintrag speichern"
          />
        )}
      </FormModal>
    </>
  )
}
