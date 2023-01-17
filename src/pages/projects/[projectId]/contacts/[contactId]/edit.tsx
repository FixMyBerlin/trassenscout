import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import { FORM_ERROR, ContactForm } from "src/contacts/components/ContactForm"
import updateContact from "src/contacts/mutations/updateContact"
import getContact from "src/contacts/queries/getContact"
import { PageHeader } from "src/core/components/PageHeader"

const EditContact = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const projectId = useParam("projectId", "number")
  const [contact, { setQueryData }] = useQuery(
    getContact,
    { id: contactId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateContactMutation] = useMutation(updateContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateContactMutation({
        id: contact.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowContactPage({
          projectId: projectId!,
          contactId: updated.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Kontakt von ${contact.name} bearbeiten`} />

      <PageHeader title={`Kontakt von ${contact.name} bearbeiten`} />
      <SuperAdminBox>
        <pre>{JSON.stringify(contact, null, 2)}</pre>
      </SuperAdminBox>

      <ContactForm submitText="Speichern" initialValues={contact} onSubmit={handleSubmit} />
    </>
  )
}

const EditContactPage: BlitzPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditContact />
      </Suspense>

      <p>
        <Link href={Routes.ContactsPage({ projectId: projectId! })}>Zurück zur Kontaktliste</Link>
      </p>
    </LayoutRs8>
  )
}

EditContactPage.authenticate = true

export default EditContactPage
