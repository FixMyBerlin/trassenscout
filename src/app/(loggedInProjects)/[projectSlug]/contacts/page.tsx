import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getContacts from "@/src/server/contacts/queries/getContacts"
import getCurrentUser from "@/src/server/users/queries/getCurrentUser"
import { Metadata, Route } from "next"
import "server-only"
import { ContactTable } from "./_components/ContactTable"
import { getContactsTabs } from "./_utils/contactsTabs"

export const metadata: Metadata = {
  title: "Kontakte",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
}

export default async function ContactsPage({ params: { projectSlug } }: Props) {
  const contactsResult = await invoke(getContacts, { projectSlug })
  const contacts = contactsResult.contacts
  const currentUser = await invoke(getCurrentUser, null)
  const tabs = await getContactsTabs(projectSlug)

  return (
    <>
      <PageHeader
        title="Externe Kontakte"
        description="Kontaktdaten, die für das ganze Projektteam wichtig sind."
        className="mt-12"
      />
      <TabsApp tabs={tabs} className="mt-7" />

      {contacts.length === 0 ? (
        <>
          <ZeroCase visible={contacts.length} name="Kontakte" />
          <IfUserCanEdit>
            <ButtonWrapper className="mt-6 justify-between">
              <Link button="blue" icon="plus" href={`/${projectSlug}/contacts/new` as Route}>
                Kontakt
              </Link>
            </ButtonWrapper>
          </IfUserCanEdit>
        </>
      ) : (
        <ContactTable
          contacts={contacts}
          currentUserEmail={currentUser?.email}
          projectSlug={projectSlug}
        />
      )}

      <SuperAdminLogData data={contacts} />
    </>
  )
}
