"use client"

import { ReprocessedProjectRecord } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailClient"
import { ProjectRecordFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFormFields"
import { Form, FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/projectRecords/m2mFields"
import updateProjectRecord from "@/src/server/projectRecords/mutations/updateProjectRecord"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { ProjectRecordFormSchema } from "@/src/server/projectRecords/schemas"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/navigation"

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
  const [updateProjectRecordMutation] = useMutation(updateProjectRecord)
  const projectSlug = useProjectSlug()

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateProjectRecordMutation({
        ...values,
        id: projectRecord.id,
        date: values.date === "" ? null : new Date(values.date),
        projectSlug,
      })
      router.refresh()
      onCancel() // Close the AI suggestions view
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  // m2m copied from subsubsection/edit.tsx
  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in projectRecord) {
      m2mFieldsInitialValues[fieldName] = Array.from(projectRecord[fieldName].values(), (obj) =>
        String(obj.id),
      )
    }
  })

  // Override current projectRecord data with AI suggestions
  const initialValues = {
    ...projectRecord,
    date: projectRecord.date ? getDate(aiSuggestions.date) : "",
    title: aiSuggestions.title || projectRecord.title,
    body: aiSuggestions.body || projectRecord.body,
    subsectionId: aiSuggestions.subsectionId ?? projectRecord.subsectionId,
    ...m2mFieldsInitialValues,
    ...(aiSuggestions.projectRecordTopics && aiSuggestions.projectRecordTopics.length > 0
      ? { projectRecordTopics: aiSuggestions.projectRecordTopics.map(String) }
      : {}),
  }

  return (
    <div className="rounded-lg bg-blue-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <SparklesIcon className="h-5 w-5 text-blue-600" />
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

      <Form
        className="grow"
        submitText="Änderungen übernehmen"
        schema={ProjectRecordFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <ProjectRecordFormFields projectSlug={projectSlug} />
        </div>
      </Form>
    </div>
  )
}
