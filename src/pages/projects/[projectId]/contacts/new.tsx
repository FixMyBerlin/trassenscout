import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import createContact from "src/contacts/mutations/createContact"
import { ContactSchema } from "src/contacts/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs8, MetaTags } from "src/core/layouts"

const NewContactPage: BlitzPage = () => {
  const projectId = useParam("projectId", "number")
  const router = useRouter()
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectId: projectId! })
      await router.push(
        Routes.ShowContactPage({
          projectId: projectId!,
          contactId: contact.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <LayoutRs8>
      <MetaTags noindex title="Neuer Kontakt" />
      <PageHeader title="Neuer Kontakt" />
      <ContactForm
        submitText="Erstellen"
        schema={ContactSchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.ContactsPage({ projectId: projectId! })}>Zurück zur Kontaktliste</Link>
      </p>
    </LayoutRs8>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
