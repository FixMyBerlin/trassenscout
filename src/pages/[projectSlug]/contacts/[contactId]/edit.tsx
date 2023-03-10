import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import updateContact from "src/contacts/mutations/updateContact"
import getContact from "src/contacts/queries/getContact"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { getFullname } from "src/users/utils"

const EditContactWithQuery = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const projectSlug = useParam("projectSlug", "string")
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
          projectSlug: projectSlug!,
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
      <MetaTags noindex title={`Kontakt von ${getFullname(contact)} bearbeiten`} />

      <PageHeader title={`Kontakt von ${getFullname(contact)}`} subtitle="Kontakt bearbeiten" />

      <ContactForm submitText="Speichern" initialValues={contact} onSubmit={handleSubmit} />

      <SuperAdminBox>
        <pre>{JSON.stringify(contact, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const EditContactPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditContactWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.ContactsPage({ projectSlug: projectSlug! })}>
          Zur??ck zur Kontaktliste
        </Link>
      </p>
    </LayoutRs>
  )
}

EditContactPage.authenticate = true

export default EditContactPage
