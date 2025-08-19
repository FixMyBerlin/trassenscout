"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import updateProtocol from "@/src/server/protocols/mutations/updateProtocol"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { ProtocolFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { ProtocolForm } from "../../../_components/ProtocolForm"

export const EditProtocolForm = ({
  initialProtocol,
  projectSlug,
  protocolId,
}: {
  initialProtocol: Awaited<ReturnType<typeof getProtocol>>
  projectSlug: string
  protocolId: number
}) => {
  const router = useRouter()
  const [protocol, { refetch }] = useQuery(
    getProtocol,
    { projectSlug, id: protocolId },
    // todo check if this works as expected
    { initialData: initialProtocol },
  )

  const [updateProtocolMutation] = useMutation(updateProtocol)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateProtocolMutation({
        ...values,
        id: protocol.id,
        date: values.date === "" ? null : new Date(values.date),
        projectSlug,
      })
      await refetch()
      router.push(`/${projectSlug}/protocols`)
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

  return (
    <>
      <ProtocolForm
        className="grow"
        submitText="Speichern"
        schema={ProtocolFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={{
          ...protocol,
          date: protocol.date ? getDate(protocol.date) : "",
          ...m2mFieldsInitialValues,
        }}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={`/${projectSlug}/protocols`}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ protocol }} />
    </>
  )
}
