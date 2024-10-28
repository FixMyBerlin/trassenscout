import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import "server-only"
import { ContactsTable } from "./_components/ContactsTable"

export const metadata: Metadata = {
  title: "Externe Kontakte bearbeiten & importieren",
}

export default async function ProjectContactsTablePage() {
  return (
    <>
      <PageHeader
        title="Externe Kontakte hinzufügen & bearbeiten"
        description="Tipp: Kontakte können per Kopieren & Einfügen aus Excel übernommen werden."
        className="mt-12"
      />
      {/* We cannot use <Tabs> here because that is strongly tied to the pages router */}
      {/* <Tabs className="mt-7" tabs={tabs} /> */}

      <ContactsTable />
    </>
  )
}
