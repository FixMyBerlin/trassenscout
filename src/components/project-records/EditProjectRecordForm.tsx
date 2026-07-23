import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { FormDirtyStateReporter } from "@/src/components/core/components/forms/FormDirtyStateReporter"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { ProjectRecordCommentsSection } from "@/src/components/project-records/ProjectRecordCommentsSection"
import { CreateEditReviewHistory } from "@/src/components/project-records/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordDeleteActionBar } from "@/src/components/project-records/ProjectRecordDeleteActionBar"
import { ProjectRecordFormFields } from "@/src/components/project-records/ProjectRecordFormFields"
import { ProjectRecordNeedsReviewBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { ReviewProjectRecordForm } from "@/src/components/project-records/ReviewProjectRecordForm"
import { getM2MInitialValues } from "@/src/components/project-records/utils/getM2MInitialValues"
import { getProjectRecordEditSuccessNavigateOptions } from "@/src/components/project-records/utils/getProjectRecordEditSuccessRoute"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import { updateProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"
import {
  projectRecordQueryOptions,
  projectRecordsNeedsReviewQueryOptions,
  projectRecordsQueryOptions,
  projectRecordsTabCountsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import {
  projectRecordFormDefaultValues,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"

const ProjectRecordSubmitButton = () => {
  const form = useCoreAppFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        assignedToId: state.values.assignedToId,
        isAssignedToDirty: state.fieldMeta.assignedToId?.isDirty,
      })}
    >
      {({ assignedToId, isAssignedToDirty }) => {
        const reassignedToPerson =
          Boolean(isAssignedToDirty) && assignedToId != null && assignedToId !== ""

        return (
          <form.SubmitButton
            label={
              reassignedToPerson
                ? "Eintrag speichern und Benachrichtigung senden"
                : "Änderungen speichern"
            }
          />
        )
      }}
    </form.Subscribe>
  )
}

export const EditProjectRecordForm = ({
  projectRecord: initialProjectRecord,
  hideBackLink = false,
  onDirtyChange,
  onSuccess,
  onSubmittingChange,
}: {
  projectRecord: ProjectRecord
  hideBackLink?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  onSuccess?: (reviewState: ProjectRecordReviewState) => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}) => {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const needsReview = initialProjectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const updateProjectRecordMutation = useMutation({ mutationFn: updateProjectRecordFn })
  const projectSlug = initialProjectRecord.project.slug
  const { data: projectRecord = initialProjectRecord } = useQuery({
    ...projectRecordQueryOptions({ projectSlug, id: initialProjectRecord.id }),
    initialData: initialProjectRecord,
  })

  const editRelationContext: "project" | "subsubsection" | "acquisitionArea" =
    projectRecord.acquisitionAreas.length > 0
      ? "acquisitionArea"
      : projectRecord.subsubsections.length > 0
        ? "subsubsection"
        : "project"

  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    m2mFieldsInitialValues[fieldName] = getM2MInitialValues(
      projectRecord[fieldName as keyof typeof projectRecord],
    )
  })

  const form = useAppForm({
    defaultValues: {
      ...projectRecordFormDefaultValues,
      date: projectRecord.date ? getDate(projectRecord.date) : "",
      title: projectRecord.title,
      body: projectRecord.body ?? "",
      subsubsectionId: projectRecord.subsubsectionId,
      acquisitionAreaId: projectRecord.acquisitionAreaId,
      assignedToId: projectRecord.assignedToId,
      editingState: projectRecord.editingState,
      reviewState: projectRecord.reviewState,
      reviewNotes: projectRecord.reviewNotes ?? "",
      ...m2mFieldsInitialValues,
    },
    validators: { onSubmit: ProjectRecordFormSchema } as never,
    onSubmit: async ({ value }) => {
      const values = value as unknown as z.infer<typeof ProjectRecordFormSchema>
      onSubmittingChange?.(true)
      try {
        await updateProjectRecordMutation.mutateAsync({
          data: {
            ...values,
            id: projectRecord.id,
            date: values.date,
            projectSlug,
            tags: values.tags === true ? false : values.tags,
            uploads: values.uploads === true ? false : values.uploads,
            subsubsections: values.subsubsections === true ? false : values.subsubsections,
            acquisitionAreas: values.acquisitionAreas === true ? false : values.acquisitionAreas,
          },
        })
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: projectRecordQueryOptions({ projectSlug, id: projectRecord.id }).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: projectRecordsNeedsReviewQueryOptions({ projectSlug }).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: projectRecordsTabCountsQueryOptions({ projectSlug }).queryKey,
          }),
        ])
        if (onSuccess) {
          onSuccess(values.reviewState)
        } else {
          navigate(
            getProjectRecordEditSuccessNavigateOptions({
              projectSlug,
              projectRecordId: projectRecord.id,
              initialReviewState: projectRecord.reviewState,
              nextReviewState: values.reviewState,
            }),
          )
        }
      } catch (error: unknown) {
        onSubmittingChange?.(false)
        applyFormSubmitResult(form, improveErrorMessage(error, FORM_ERROR, ["slug"]), setFormError)
      }
    },
  })

  const showPath = router.buildLocation({
    to: "/$projectSlug/project-records/$projectRecordId",
    params: { projectSlug, projectRecordId: String(projectRecord.id) },
  }).href
  const indexPath = router.buildLocation({
    to: "/$projectSlug/project-records",
    params: { projectSlug },
  }).href

  return (
    <>
      {needsReview && <ProjectRecordNeedsReviewBanner />}
      {projectRecord.projectRecordAuthorType === "SYSTEM" && (
        <div className={pageContentPaddingClassName}>
          <SuperAdminBox className="mb-6">
            In die{" "}
            <Link
              blank
              to="/admin/project-records/$projectRecordId/edit"
              params={{ projectRecordId: String(projectRecord.id) }}
              className="text-blue-500 hover:underline"
            >
              Admin-Ansicht
            </Link>{" "}
            wechseln, um Bestätigungsstatus zu ändern.
          </SuperAdminBox>
        </div>
      )}
      <FormShell
        form={form}
        formError={formError}
        submitText="Änderungen speichern"
        hideSubmitButton
        actionBarLeft={<ProjectRecordSubmitButton />}
        actionBarRight={
          <ProjectRecordDeleteActionBar
            projectSlug={projectSlug}
            projectRecordId={projectRecord.id}
            projectRecordTitle={projectRecord.title}
            returnPath={indexPath}
            uploadsCount={projectRecord.uploads.length}
          />
        }
      >
        <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
        <ProjectRecordFormFields
          formMode="edit"
          relationContext={editRelationContext}
          projectSlug={projectSlug}
          splitView={needsReview}
          emailSource={projectRecord.projectRecordEmail ?? undefined}
          landAcquisitionModuleEnabled={projectRecord.project.landAcquisitionModuleEnabled}
        />

        {needsReview && <ReviewProjectRecordForm />}
      </FormShell>
      <CreateEditReviewHistory projectRecord={projectRecord} />
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
      {!hideBackLink && (
        <div className={pageContentPaddingClassName}>
          <BackLink to={showPath} text="Zurück zum Protokolleintrag" />
        </div>
      )}
      <SuperAdminLogData data={{ initialValues: projectRecord }} />
    </>
  )
}
