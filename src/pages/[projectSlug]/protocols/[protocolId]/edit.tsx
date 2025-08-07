import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { ProtocolForm } from "@/src/pagesComponents/protocols/ProtocolForm"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import updateProtocol from "@/src/server/protocols/mutations/updateProtocol"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { ProtocolFormSchema } from "@/src/server/protocols/schemas"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditProtocolWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const protocolId = useParam("protocolId", "number")
  const [protocol, { refetch }] = useQuery(getProtocol, { projectSlug, id: protocolId })

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
      await router.push(Routes.ProtocolsPage({ projectSlug }))
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
        <Link href={Routes.ProtocolsPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ protocol }} />
    </>
  )
}

const EditProtocolPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Projektprotokoll")} />
      <PageHeader title="Projektprotokoll bearbeiten" className="mt-12" />
      <Suspense fallback={<Spinner page />}>
        <EditProtocolWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditProtocolPage.authenticate = true

export default EditProtocolPage
