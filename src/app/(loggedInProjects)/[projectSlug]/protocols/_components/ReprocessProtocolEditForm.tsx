"use client"

import { ReprocessedProtocol } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/[protocolId]/_components/ProtocolDetailClient"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import updateProtocol from "@/src/server/protocols/mutations/updateProtocol"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { ProtocolFormSchema } from "@/src/server/protocols/schemas"
import { useMutation } from "@blitzjs/rpc"
import { SparklesIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/navigation"
import { ProtocolForm } from "./ProtocolForm"

type Props = {
  protocol: Awaited<ReturnType<typeof getProtocol>>
  aiSuggestions: ReprocessedProtocol
  onCancel: () => void
}

export const ReprocessProtocolEditForm = ({ protocol, aiSuggestions, onCancel }: Props) => {
  const router = useRouter()
  const [updateProtocolMutation] = useMutation(updateProtocol)
  const projectSlug = useProjectSlug()

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateProtocolMutation({
        ...values,
        id: protocol.id,
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
    if (fieldName in protocol) {
      m2mFieldsInitialValues[fieldName] = Array.from(protocol[fieldName].values(), (obj) =>
        String(obj.id),
      )
    }
  })

  // Override current protocol data with AI suggestions
  const initialValues = {
    ...protocol,
    date: protocol.date ? getDate(aiSuggestions.date) : "",
    title: aiSuggestions.title || protocol.title,
    body: aiSuggestions.body || protocol.body,
    subsectionId: aiSuggestions.subsectionId ?? protocol.subsectionId,
    ...m2mFieldsInitialValues,
    ...(aiSuggestions.protocolTopics && aiSuggestions.protocolTopics.length > 0
      ? { protocolTopics: aiSuggestions.protocolTopics.map(String) }
      : {}),
  }

  return (
    <div className="rounded-lg bg-blue-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-medium">
          <SparklesIcon className="h-5 w-5 text-blue-600" />
          KI-Vorschlag für verbessertes Protokoll
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
          Die KI hat Verbesserungsvorschläge für dieses Protokoll erstellt. Bitte überprüfen Sie die
          vorgeschlagenen Änderungen und speichern Sie das Formular, wenn Sie zufrieden sind.
        </p>
      </div>

      <ProtocolForm
        className="grow"
        submitText="Änderungen übernehmen"
        schema={ProtocolFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={initialValues}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  )
}
