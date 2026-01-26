import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getContact from "@/src/server/contacts/queries/getContact"
import { Metadata } from "next"
import "server-only"
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

  return (
    <>
      <PageHeader title="Kontakt bearbeiten" className="mt-12" />
      <EditContactForm contact={contact} projectSlug={projectSlug} />
    </>
  )
}
