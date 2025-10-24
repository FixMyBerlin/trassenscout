"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import deleteProtocol from "@/src/server/protocols/mutations/deleteProtocol"
import updateProtocol from "@/src/server/protocols/mutations/updateProtocol"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { ProtocolFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
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
  const [deleteProtocolMutation] = useMutation(deleteProtocol)

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${protocolId} unwiderruflich löschen?`)) {
      try {
        await deleteProtocolMutation({
          id: protocolId,
          projectSlug,
        })
        router.push(`/${projectSlug}/protocols`)
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

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
      router.push(`/${projectSlug}/protocols/${protocol.id}`)
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
        submitText="Protokoll speichern"
        schema={ProtocolFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={{
          ...protocol,
          date: protocol.date ? getDate(protocol.date) : "",
          ...m2mFieldsInitialValues,
        }}
        onSubmit={handleSubmit}
        mode="edit"
      />

      <p className="mt-10">
        <Link href={`/${projectSlug}/protocols`}>← Zurück zur Protokoll-Übersicht</Link>
      </p>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={{ protocol }} />
    </>
  )
}
