"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { ProjectRecordNeedsReviewBanner } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNeedsReviewBanner"
import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReviewProjectRecordForm"
import { getM2MInitialValues } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/getM2MInitialValues"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import deleteProjectRecord from "@/src/server/projectRecords/mutations/deleteProjectRecord"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import {
  projectRecordFormDefaultValues,
  ProjectRecordFormSchema,
} from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

export const AdminEditProjectRecordForm = ({
  projectRecord,
}: {
  projectRecord: Awaited<ReturnType<typeof getProjectRecordAdmin>>
}) => {
  const router = useRouter()
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const [deleteProjectRecordMutation] = useMutation(deleteProjectRecord)
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
        await updateProjectRecordMutation({
          ...values,
          id: projectRecord.id,
          date: values.date === "" ? null : new Date(values.date),
          projectSlug,
          projectRecordTopics:
            values.projectRecordTopics === true ? false : values.projectRecordTopics,
          uploads: values.uploads === true ? false : values.uploads,
          subsubsections: values.subsubsections === true ? false : values.subsubsections,
          acquisitionAreas: values.acquisitionAreas === true ? false : values.acquisitionAreas,
          projectRecordEmailId: projectRecord.projectRecordEmailId,
        })
        router.push(`/admin/project-records`)
        router.refresh()
      } catch (error: any) {
        applyFormSubmitResult(form, improveErrorMessage(error, FORM_ERROR, ["slug"]), setFormError)
      }
    },
  })

  return (
    <>
      {!projectRecord.project.aiEnabled && projectRecord.projectRecordAuthorType === "SYSTEM" && (
        <div className="mb-6 inline-flex flex-col space-y-2 rounded-md border border-gray-200 bg-red-200 p-4 text-gray-700">
          <p className="text-sm">
            In diesem Projekt ist die KI-Unterstützung deaktiviert. Damit Protokolleinträge für
            Projektmitglieder sichtbar werden, müssen KI Features aktiviert werden.
          </p>
        </div>
      )}
      {needsReview && <ProjectRecordNeedsReviewBanner />}

      <FormShell
        form={form}
        formError={formError}
        submitText="Änderungen speichern"
        actionBarRight={
          <DeleteActionBar
            itemTitle={projectRecord.title}
            onDelete={() => deleteProjectRecordMutation({ id: projectRecord.id, projectSlug })}
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
