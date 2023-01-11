import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import getContact from "src/contacts/queries/getContact"
import updateContact from "src/contacts/mutations/updateContact"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import { Link } from "src/core/components/links"
import { ContactSchema } from "src/contacts/schema"
import { BlitzPage } from "@blitzjs/auth"
import { PageHeader } from "src/core/components/PageHeader"
import { AdminBox } from "src/core/components/AdminBox"

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
      <AdminBox>
        <pre>{JSON.stringify(contact, null, 2)}</pre>
      </AdminBox>
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
