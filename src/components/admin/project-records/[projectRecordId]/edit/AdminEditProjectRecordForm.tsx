import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { CreateEditReviewHistory } from "@/src/components/project-records/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordFormFields } from "@/src/components/project-records/ProjectRecordFormFields"
import { ProjectRecordNeedsReviewBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { ReviewProjectRecordForm } from "@/src/components/project-records/ReviewProjectRecordForm"
import { getM2MInitialValues } from "@/src/components/project-records/utils/getM2MInitialValues"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import {
  deleteProjectRecordFn,
  updateProjectRecordFn,
} from "@/src/server/projectRecords/projectRecords.functions"
import { projectRecordAdminQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import {
  projectRecordFormDefaultValues,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"

type Props = {
  projectRecordId: number
}

export const AdminEditProjectRecordForm = ({ projectRecordId }: Props) => {
  const navigate = useNavigate()
  const { data: projectRecord } = useSuspenseQuery(projectRecordAdminQueryOptions(projectRecordId))
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const updateProjectRecordMutation = useMutation({ mutationFn: updateProjectRecordFn })
  const deleteProjectRecordMutation = useMutation({ mutationFn: deleteProjectRecordFn })
  const [formError, setFormError] = useState<string | null>(null)

  const projectSlug = projectRecord.project.slug

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
      try {
        await updateProjectRecordMutation.mutateAsync({
          data: {
            ...values,
            id: projectRecord.id,
            date: values.date === "" ? "" : values.date,
            projectSlug,
            tags: values.tags === true ? false : values.tags,
            uploads: values.uploads === true ? false : values.uploads,
            subsubsections: values.subsubsections === true ? false : values.subsubsections,
            acquisitionAreas: values.acquisitionAreas === true ? false : values.acquisitionAreas,
          },
        })
        navigate({ to: `/admin/project-records` })
      } catch (error: unknown) {
        applyFormSubmitResult(form, improveErrorMessage(error, FORM_ERROR, ["slug"]), setFormError)
      }
    },
  })

  return (
    <>
      {needsReview && <ProjectRecordNeedsReviewBanner />}
      {!projectRecord.project.aiEnabled && projectRecord.projectRecordAuthorType === "SYSTEM" && (
        <div className={pageContentPaddingClassName}>
          <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-red-200 p-4 text-gray-700">
            <p className="text-sm">
              In diesem Projekt ist die KI-Unterstützung deaktiviert. Damit Protokolleinträge für
              Projektmitglieder sichtbar werden, müssen KI Features aktiviert werden.
            </p>
          </div>
        </div>
      )}

      <FormShell
        form={form}
        formError={formError}
        submitText="Änderungen speichern"
        actionBarRight={
          <DeleteActionBar
            itemTitle={projectRecord.title}
            onDelete={() =>
              deleteProjectRecordMutation.mutateAsync({
                data: { id: projectRecord.id, projectSlug },
              })
            }
            returnPath="/admin/project-records"
          />
        }
      >
        <p>
          Projekt: <span className="font-medium uppercase">{projectSlug}</span>
        </p>
        <div className="space-y-6">
          <ProjectRecordFormFields
            projectSlug={projectSlug}
            splitView={true}
            emailSource={projectRecord.projectRecordEmail}
          />
        </div>
        <ReviewProjectRecordForm admin />
      </FormShell>

      <CreateEditReviewHistory projectRecord={projectRecord} />
    </>
  )
}
