import { Disclosure } from "@/src/core/components/Disclosure"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H3, seoIndexTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { ProtocolForm } from "@/src/pagesComponents/protocols/ProtocolForm"
import { ProtocolsTable } from "@/src/pagesComponents/protocols/ProtocolsTable"
import createProtocol from "@/src/server/protocols/mutations/createProtocol"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { BlitzPage } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { Suspense } from "react"

export const ProtocolsWithQuery = () => {
  const projectSlug = useProjectSlug()
  const [protocols, { refetch }] = useQuery(getProtocols, { projectSlug })
  const [createProtocolMutation] = useMutation(createProtocol)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const protocol = await createProtocolMutation({
        ...values,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
      })
      refetch()
    } catch (error: any) {
      // ?
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <IfUserCanEdit>
        <Disclosure
          classNameButton="py-4 px-6 text-left bg-gray-100 rounded-t-md"
          classNamePanel="px-6 pb-3 bg-gray-100 rounded-b-md"
          open
          button={
            <div className="flex-auto">
              <H3 className={clsx("pr-10 md:pr-0")}>Neuer Protokolleintrag</H3>
              <small>
                Neuen Protokolleintrag verfassen. Zum Ein- oder Ausklappen auf den Pfeil oben rechts
                klicken.
              </small>
            </div>
          }
        >
          <ProtocolForm
            resetOnSubmit
            onSubmit={handleSubmit}
            submitText="Protokoll speichern"
            initialValues={{ date: getDate(new Date()) }}
          />
        </Disclosure>
      </IfUserCanEdit>
      <ProtocolsTable protocols={protocols} />
    </>
  )
}

const ProtocolsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoIndexTitle("Projektprotokoll")} />
      <PageHeader title="Projektprotokoll" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <ProtocolsWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ProtocolsPage.authenticate = true

export default ProtocolsPage
