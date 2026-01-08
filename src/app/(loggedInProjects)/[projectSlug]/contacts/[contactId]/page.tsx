import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import getContact from "@/src/server/contacts/queries/getContact"
import { Metadata, Route } from "next"
import "server-only"
import { ContactActions } from "../_components/ContactActions"
import { ContactSingle } from "../_components/ContactSingle"
import { getContactsTabs } from "../_utils/contactsTabs"

export const metadata: Metadata = {
  title: "Kontakt",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; contactId: string }
}

export default async function ShowContactPage({ params: { projectSlug, contactId } }: Props) {
  const contact = await invoke(getContact, { projectSlug, id: Number(contactId) })
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader title={`Kontakt von ${getFullname(contact)}`} className="mt-12" />
      <TabsApp tabs={tabs} className="mt-7" />

      <IfUserCanEdit>
        <p className="mb-10 space-x-4">
          <Link href={`/${projectSlug}/contacts/${contactId}/edit` as Route}>
            Eintrag bearbeiten
          </Link>
          <span>–</span>
          <ContactActions contactId={Number(contactId)} projectSlug={projectSlug} />
        </p>
      </IfUserCanEdit>

      <div>
        <ContactSingle contact={contact} />
        <SuperAdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </SuperAdminBox>
      </div>

      <hr className="my-5 text-gray-200" />
      <Link href={`/${projectSlug}/contacts` as Route}>Zurück zur Kontaktliste</Link>
    </>
  )
}
