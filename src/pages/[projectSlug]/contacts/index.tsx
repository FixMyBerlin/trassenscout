import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactTable } from "src/contacts/components/ContactTable"
import getContacts from "src/contacts/queries/getContacts"
import { Link } from "src/core/components/links"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"

export const ContactPageWithQuery = () => {
  const projectSlug = useParam("projectSlug", "string")
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
    <div className="mt-8 flex flex-col">
      <ContactTable contacts={contacts} />

      <SuperAdminLogData data={contacts} />
    </div>
  )
}

const ContactsPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  return (
    <LayoutRs>
      <MetaTags noindex title="Kontakte" />
      <div>
        <PageHeader
          title="Kontakte"
          description="Dieser Bereich hilft Ihnen dabei Kontakte zu verwalten und
        anzuschreiben."
        />
        <Suspense fallback={<Spinner page />}>
          <ContactPageWithQuery />
        </Suspense>
      </div>
    </LayoutRs>
  )
}

export default ContactsPage
