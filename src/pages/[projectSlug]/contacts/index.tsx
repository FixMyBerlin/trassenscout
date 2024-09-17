import { ContactTable } from "@/src/contacts/components/ContactTable"
import getContacts from "@/src/contacts/queries/getContacts"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

export const ContactsWithQuery = () => {
  const { projectSlug } = useSlugs()
  const [{ contacts }] = usePaginatedQuery(getContacts, { projectSlug: projectSlug! })

  if (!contacts.length) {
    return <ZeroCase visible={contacts.length} name="Kontakte" />
  }

  return (
    <>
      <PageHeader
        title="Externe Kontakte"
        description="Kontaktdaten, die für das ganze Projektteam wichtig sind."
        className="mt-12"
      />

      <Tabs
        className="mt-7"
        tabs={[
          { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
          { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
        ]}
      />

      <ContactTable contacts={contacts} />

      <SuperAdminLogData data={contacts} />
    </>
  )
}

const ContactsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Kontakte" />

      <Suspense fallback={<Spinner page />}>
        <ContactsWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ContactsPage.authenticate = true

export default ContactsPage
