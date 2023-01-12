import { BlitzPage } from "@blitzjs/auth"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import updateContact from "src/contacts/mutations/updateContact"
import getContact from "src/contacts/queries/getContact"
import { ContactSchema } from "src/contacts/schema"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs8, MetaTags } from "src/core/layouts"

const EditContact = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
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
      await router.push(Routes.ShowContactPage({ contactId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Kontakt bearbeiten" />
      <PageHeader title="Kontakt bearbeiten" />
      <ContactForm
        submitText="Speichern"
        schema={ContactSchema}
        initialValues={contact}
        onSubmit={handleSubmit}
      />
      <SuperAdminBox>
        <pre>{JSON.stringify(contact, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const EditContactPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditContact />
      </Suspense>

      <p>
        <Link href={Routes.ContactsPage()}>Zurück zur Kontaktliste</Link>
      </p>
    </LayoutRs8>
  )
}

EditContactPage.authenticate = true

export default EditContactPage
