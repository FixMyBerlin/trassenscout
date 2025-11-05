import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { ContactForm } from "@/src/pagesComponents/contacts/ContactForm"
import updateContact from "@/src/server/contacts/mutations/updateContact"
import getContact from "@/src/server/contacts/queries/getContact"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditContactWithQuery = () => {
  const router = useRouter()
  const contactId = useParam("contactId", "number")
  const projectSlug = useProjectSlug()
  const [contact, { setQueryData }] = useQuery(
    getContact,
    { projectSlug, id: contactId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateContactMutation] = useMutation(updateContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateContactMutation({
        ...values,
        id: contact.id,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowContactPage({
          projectSlug,
          contactId: updated.id,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }
  return (
    <>
      <ContactForm submitText="Speichern" initialValues={contact} onSubmit={handleSubmit} />

      <SuperAdminLogData data={contact} />
    </>
  )
}

const EditContactPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Kontakt")} />
      <PageHeader title="Kontakt bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditContactWithQuery />
      </Suspense>

      <hr className="my-5 text-gray-200" />
      <Link href={Routes.ContactsPage({ projectSlug })}>Zurück zur Kontaktliste</Link>
    </LayoutRs>
  )
}

EditContactPage.authenticate = true

export default EditContactPage
