import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { ActionBar } from "@/src/core/components/forms/ActionBar"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getContact from "@/src/server/contacts/queries/getContact"
import { Metadata, Route } from "next"
import "server-only"
import { ContactDeleteActionBar } from "../_components/ContactDeleteActionBar"
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
        <ActionBar
          className="mb-10"
          left={
            <Link href={`/${projectSlug}/contacts/${contactId}/edit` as Route} button>
              Eintrag bearbeiten
            </Link>
          }
          right={
            <ContactDeleteActionBar
              contactId={contact.id}
              projectSlug={projectSlug}
              contactTitle={getFullname(contact) || "Kontakt"}
              returnPath={`/${projectSlug}/contacts` as Route}
            />
          }
        />
      </IfUserCanEdit>

      <div>
        <ContactSingle contact={contact} />
        <SuperAdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </SuperAdminBox>
      </div>

      <BackLink href={`/${projectSlug}/contacts` as Route} text="Zurück zur Kontaktliste" />
    </>
  )
}
