import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactSingle } from "src/contacts/components/ContactSingle"
import deleteContact from "src/contacts/mutations/deleteContact"
import getContact from "src/contacts/queries/getContact"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { getFullname } from "src/users/utils"

export const ContactWithQuery = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const projectSlug = useParam("projectSlug", "string")
  const [deleteContactMutation] = useMutation(deleteContact)
  const [contact] = useQuery(getContact, { id: contactId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${contact.id} unwiderruflich löschen?`)) {
      await deleteContactMutation({ id: contact.id })
      await router.push(Routes.ContactsPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Kontakt von ${getFullname(contact)}`} />
      <PageHeader title={`Kontakt von ${getFullname(contact)}`} className="mt-12" />

      <p className="mb-10 space-x-4">
        <Link href={Routes.EditContactPage({ contactId: contact.id, projectSlug: projectSlug! })}>
          Eintrag bearbeiten
        </Link>
        <span>–</span>
        <button type="button" onClick={handleDelete} className={linkStyles}>
          Eintrag löschen
        </button>
      </p>
      <div>
        <ContactSingle contact={contact} />
        <SuperAdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </SuperAdminBox>
      </div>
      <Link href={Routes.ContactsPage({ projectSlug: projectSlug! })}>Zurück zur Kontaktliste</Link>
    </>
  )
}

const ShowContactPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <ContactWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ShowContactPage.authenticate = true

export default ShowContactPage
