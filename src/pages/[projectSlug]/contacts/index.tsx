import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { ContactTable } from "src/contacts/components/ContactTable"
import getContacts from "src/contacts/queries/getContacts"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"

export const ContactWithQuery = () => {
  const { projectSlug } = useSlugs()
  const [{ contacts }] = usePaginatedQuery(getContacts, {
    projectSlug: projectSlug!,
    orderBy: { id: "asc" },
  })

  if (!contacts.length) {
    return (
      <p className="text-center text-xl text-gray-500">
        <span>Es wurden noch keine Kontakte eingetragen.</span>
      </p>
    )
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
        <ContactWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

export default ContactsPage
