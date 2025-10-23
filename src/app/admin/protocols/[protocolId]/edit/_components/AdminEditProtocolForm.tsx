"use client"

import { ProtocolFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolFormFields"
import { Form, LabeledSelect } from "@/src/core/components/forms"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import getProjects from "@/src/server/projects/queries/getProjects"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import deleteProtocolAdmin from "@/src/server/protocols/mutations/deleteProtocolAdmin"
import updateProtocolAdmin from "@/src/server/protocols/mutations/updateProtocolAdmin"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { ProtocolUpdateAdminFormSchema } from "@/src/server/protocols/schemas"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"

export const AdminEditProtocolForm = ({
  initialProtocol,
  protocolId,
}: {
  initialProtocol: Awaited<ReturnType<typeof getProtocolAdmin>>
  protocolId: number
}) => {
  const router = useRouter()
  const [protocol, { refetch }] = useQuery(
    getProtocolAdmin,
    { id: protocolId },
    { initialData: initialProtocol },
  )
  const [{ projects }] = useQuery(getProjects, {})

  const [updateProtocolMutation] = useMutation(updateProtocolAdmin)
  const [deleteProtocolMutation] = useMutation(deleteProtocolAdmin)

  const projectOptions: [string | number, string][] = projects.map((project) => [
    project.id,
    project.slug,
  ])
  projectOptions.unshift(["", "Keine Angabe"])

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${protocolId} unwiderruflich löschen?`)) {
      try {
        await deleteProtocolMutation({
          id: protocolId,
        })
        router.push("/admin/protocols")
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
      })
      await refetch()
      router.push(`/admin/protocols/${protocol.id}/review`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  // m2m copied from subsubsection/edit.tsx
  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in protocol) {
      // @ts-expect-error
      m2mFieldsInitialValues[fieldName] = Array.from(protocol[fieldName].values(), (obj) =>
        String(obj.id),
      )
    }
  })

  return (
    <>
      <Form
        submitText="Protokoll speichern"
        schema={ProtocolUpdateAdminFormSchema}
        // @ts-expect-error Protocol type mismatch with form schema for m2m fields
        initialValues={{
          ...protocol,
          date: protocol.date ? getDate(protocol.date) : "",
          ...m2mFieldsInitialValues,
        }}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          {projectOptions.length > 0 && (
            <LabeledSelect name="projectId" options={projectOptions} label="Projekt" />
          )}
        </div>
        <ProtocolFormFields projectSlug={protocol.project.slug} />
      </Form>

      <div className="mt-10">
        <Link href={`/admin/protocols/${protocol.id}/review`}>← Zurück zur Protokoll-Review</Link>
        <br />
        <Link href="/admin/protocols">← Zurück zur Protokoll-Übersicht</Link>
      </div>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>
    </>
  )
}
