import { Suspense } from "react"
import { ContactsTable } from "@/src/components/contacts/ContactsTable"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"

export function PageContactsTable() {
  return (
    <>
      <PageHeader
        title="Externe Kontakte"
        description="Tipp: Kontakte können per Kopieren & Einfügen aus Excel übernommen werden."
      />
      <Suspense fallback={<Spinner page />}>
        <ContactsTable />
      </Suspense>
    </>
  )
}
