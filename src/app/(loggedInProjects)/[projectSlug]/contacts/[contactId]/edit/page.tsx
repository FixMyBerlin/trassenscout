import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { seoEditTitle } from "@/src/core/components/text"
import getContact from "@/src/server/contacts/queries/getContact"
import { Metadata, Route } from "next"
import "server-only"
import { getContactsTabs } from "../../_utils/contactsTabs"
import { EditContactForm } from "../_components/EditContactForm"

export const metadata: Metadata = {
  title: seoEditTitle("Kontakt"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; contactId: string }
}

export default async function EditContactPage({ params: { projectSlug, contactId } }: Props) {
  const contact = await invoke(getContact, { projectSlug, id: Number(contactId) })
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader title="Kontakt bearbeiten" className="mt-12" />
      <TabsApp tabs={tabs} className="mt-7" />
      <EditContactForm contact={contact} projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/contacts` as Route}>Zurück zur Kontaktliste</Link>
    </>
  )
}
