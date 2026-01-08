import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { Metadata } from "next"
import "server-only"
import { getContactsTabs } from "../_utils/contactsTabs"
import { ContactsTable } from "./_components/ContactsTable"

export const metadata: Metadata = {
  title: "Externe Kontakte bearbeiten & importieren",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function ProjectContactsTablePage({ params: { projectSlug } }: Props) {
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader
        title="Externe Kontakte hinzufügen & bearbeiten"
        description="Tipp: Kontakte können per Kopieren & Einfügen aus Excel übernommen werden."
        className="mt-12"
      />
      <TabsApp tabs={tabs} className="mt-7" />

      <ContactsTable />
    </>
  )
}
