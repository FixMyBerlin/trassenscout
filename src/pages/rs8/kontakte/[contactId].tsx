import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getContact from "src/contacts/queries/getContact"
import deleteContact from "src/contacts/mutations/deleteContact"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"

export const Contact = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const [deleteContactMutation] = useMutation(deleteContact)
  const [contact] = useQuery(getContact, { id: contactId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${contact.id} löschen?`)) {
      await deleteContactMutation({ id: contact.id })
      await router.push(Routes.ContactsPage())
    }
  }

  return (
    <>
      <MetaTags noindex title="Kontakt {contact.name}" />

      <div>
        <h1>{contact.name}</h1>
        <pre>{JSON.stringify(contact, null, 2)}</pre>

        <Link href={Routes.EditContactPage({ contactId: contact.id })}>Bearbeiten</Link>

        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
      </div>
    </>
  )
}

const ShowContactPage = () => {
  return (
    <LayoutArticle>
      <p>
        <Link href={Routes.ContactsPage()}>Alle Kontakte</Link>
      </p>

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Contact />
      </Suspense>
    </LayoutArticle>
  )
}

ShowContactPage.authenticate = true

export default ShowContactPage
