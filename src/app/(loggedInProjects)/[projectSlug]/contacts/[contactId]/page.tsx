import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getContact from "@/src/server/contacts/queries/getContact"
import { Metadata, Route } from "next"
import "server-only"
import { ContactActions } from "../_components/ContactActions"
import { ContactSingle } from "../_components/ContactSingle"

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

  return (
    <>
      <PageHeader title={`Kontakt von ${getFullname(contact)}`} className="mt-12" />
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

      <DeleteAndBackLinkFooter
        fieldName="Kontakt"
        id={contact.id}
        backHref={`/${projectSlug}/contacts` as Route}
        backText="Zurück zur Kontaktliste"
      />
    </>
  )
}
