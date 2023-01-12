import { BlitzPage, Routes as PageRoutes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactList } from "src/contacts/components/ContactList"
import deleteContact from "src/contacts/mutations/deleteContact"
import getContact from "src/contacts/queries/getContact"
import { AdminBox } from "src/core/components/AdminBox"
import { Link, LinkMail, linkStyles, LinkTel } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { quote } from "src/core/components/text"
import { LayoutRs8, MetaTags } from "src/core/layouts"

export const Contact = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const [deleteContactMutation] = useMutation(deleteContact)
  const [contact] = useQuery(getContact, { id: contactId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${contact.id} löschen?`)) {
      await deleteContactMutation({ id: contact.id })
      await router.push(PageRoutes.ContactsPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`Kontakt ${quote(contact.name)}`} />
      <PageHeader title={contact.name} />
      <p className="mb-10 space-x-4">
        <Link href={PageRoutes.ContactsPage()}>Zurück zur Kontaktliste</Link>
        <span>–</span>
        <Link href={PageRoutes.EditContactPage({ contactId: contact.id })}>Eintrag bearbeiten</Link>
        <span>–</span>
        <button type="button" onClick={handleDelete} className={linkStyles}>
          Eintrag löschen
        </button>
      </p>
      <div>
        <ContactList withAction={false} contacts={[contact]} />
        <AdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </AdminBox>
      </div>
    </>
  )
}

const ShowContactPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Contact />
      </Suspense>
    </LayoutRs8>
  )
}

ShowContactPage.authenticate = true

export default ShowContactPage
