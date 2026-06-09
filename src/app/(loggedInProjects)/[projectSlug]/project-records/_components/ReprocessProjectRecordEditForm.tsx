"use client"

import { ReprocessedProjectRecord } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailClient"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { getM2MInitialValues } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/getM2MInitialValues"
import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import {
  projectRecordFormDefaultValues,
  ProjectRecordFormSchema,
} from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

type Props = {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
  aiSuggestions: ReprocessedProjectRecord
  onCancel: () => void
}

export const ReprocessProjectRecordEditForm = ({
  projectRecord,
  aiSuggestions,
  onCancel,
}: Props) => {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const projectSlug = useProjectSlug()

  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    m2mFieldsInitialValues[fieldName] = getM2MInitialValues(
      projectRecord[fieldName as keyof typeof projectRecord],
    )
  })

  const form = useAppForm({
    defaultValues: {
      ...projectRecordFormDefaultValues,
      date: projectRecord.date ? getDate(aiSuggestions.date) : "",
      title: aiSuggestions.title || projectRecord.title,
      body: aiSuggestions.body || projectRecord.body,
      subsubsectionId: projectRecord.subsubsectionId,
      acquisitionAreaId: projectRecord.acquisitionAreaId,
      assignedToId: projectRecord.assignedToId,
      editingState: projectRecord.editingState,
      reviewState: projectRecord.reviewState,
      reviewNotes: projectRecord.reviewNotes ?? "",
      ...m2mFieldsInitialValues,
      ...(aiSuggestions.projectRecordTopics && aiSuggestions.projectRecordTopics.length > 0
        ? { projectRecordTopics: aiSuggestions.projectRecordTopics.map(String) }
        : {}),
    },
    validators: { onSubmit: ProjectRecordFormSchema } as never,
    onSubmit: async ({ value }) => {
      const values = value as unknown as z.infer<typeof ProjectRecordFormSchema>
      try {
        const { uploads, projectRecordTopics, subsubsections, acquisitionAreas, ...restValues } =
          values
        await updateProjectRecordMutation({
          ...restValues,
          id: projectRecord.id,
          date: values.date === "" ? null : new Date(values.date),
          projectSlug,
          uploads: Array.isArray(uploads) ? uploads : undefined,
          projectRecordTopics: Array.isArray(projectRecordTopics) ? projectRecordTopics : undefined,
          subsubsections: Array.isArray(subsubsections) ? subsubsections : undefined,
          acquisitionAreas: Array.isArray(acquisitionAreas) ? acquisitionAreas : undefined,
        })
        router.refresh()
        onCancel()
      } catch (error: any) {
        applyFormSubmitResult(form, improveErrorMessage(error, FORM_ERROR, ["slug"]), setFormError)
      }
    },
  })

  return (
    <div className="rounded-lg bg-blue-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <SparklesIcon className="size-5 text-blue-600" />
          KI-Vorschlag für verbesserten Protokolleintrag
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Abbrechen
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-100 p-4">
        <p className="text-sm text-gray-700">
          Die KI hat Verbesserungsvorschläge für diesen Protokolleintrag erstellt. Bitte überprüfen
          Sie die vorgeschlagenen Änderungen und speichern Sie das Formular, wenn Sie zufrieden
          sind.
        </p>
      </div>

      <FormShell
        form={form}
        formError={formError}
        className="grow"
        submitText="Änderungen übernehmen"
      >
        <div className="space-y-6">
          <ProjectRecordFormFields projectSlug={projectSlug} />
        </div>
      </FormShell>
    </div>
  )
}
