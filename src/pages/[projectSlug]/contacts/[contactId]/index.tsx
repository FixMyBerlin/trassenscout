import { ContactSingle } from "@/src/contacts/components/ContactSingle"
import deleteContact from "@/src/contacts/mutations/deleteContact"
import getContact from "@/src/contacts/queries/getContact"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, linkStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { getFullname } from "@/src/users/utils"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const ContactWithQuery = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const projectSlug = useProjectSlug()
  const [deleteContactMutation] = useMutation(deleteContact)
  const [contact] = useQuery(getContact, { projectSlug, id: contactId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${contact.id} unwiderruflich löschen?`)) {
      await deleteContactMutation({ id: contact.id })
      await router.push(Routes.ContactsPage({ projectSlug }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Kontakt von ${getFullname(contact)}`} />
      <PageHeader title={`Kontakt von ${getFullname(contact)}`} className="mt-12" />

      <IfUserCanEdit>
        <p className="mb-10 space-x-4">
          <Link href={Routes.EditContactPage({ contactId: contact.id, projectSlug })}>
            Eintrag bearbeiten
          </Link>
          <span>–</span>
          <button type="button" onClick={handleDelete} className={linkStyles}>
            Eintrag löschen
          </button>
        </p>
      </IfUserCanEdit>

      <div>
        <ContactSingle contact={contact} />
        <SuperAdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </SuperAdminBox>
      </div>

      <Link href={Routes.ContactsPage({ projectSlug })}>Zurück zur Kontaktliste</Link>
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
