import { SparklesIcon } from "@heroicons/react/20/solid"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { ReprocessedProjectRecord } from "@/src/components/project-records/ProjectRecordDetailClient"
import { ProjectRecordFormFields } from "@/src/components/project-records/ProjectRecordFormFields"
import { getM2MInitialValues } from "@/src/components/project-records/utils/getM2MInitialValues"
import { getDate } from "@/src/components/project-records/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import { updateProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"
import {
  projectRecordQueryOptions,
  projectRecordsNeedsReviewQueryOptions,
  projectRecordsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import {
  projectRecordFormDefaultValues,
  ProjectRecordFormSchema,
} from "@/src/shared/projectRecords/schemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  projectRecord: ProjectRecord
  aiSuggestions: ReprocessedProjectRecord
  onCancel: () => void
}

export const ReprocessProjectRecordEditForm = ({
  projectRecord,
  aiSuggestions,
  onCancel,
}: Props) => {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const updateProjectRecordMutation = useMutation({ mutationFn: updateProjectRecordFn })
  const { projectSlug } = loggedInProjectRouteApi.useParams()

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
        await updateProjectRecordMutation.mutateAsync({
          data: {
            ...restValues,
            id: projectRecord.id,
            date: values.date,
            projectSlug,
            uploads: Array.isArray(uploads) ? uploads : undefined,
            projectRecordTopics: Array.isArray(projectRecordTopics)
              ? projectRecordTopics
              : undefined,
            subsubsections: Array.isArray(subsubsections) ? subsubsections : undefined,
            acquisitionAreas: Array.isArray(acquisitionAreas) ? acquisitionAreas : undefined,
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
        ])
        onCancel()
      } catch (error: unknown) {
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
