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
  const projectSlug = useParam("projectSlug", "string")
  const router = useRouter()
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectSlug: projectSlug! })
      await router.push(
        Routes.ShowContactPage({
          projectSlug: projectSlug!,
          contactId: contact.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
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
        <Link href={Routes.ContactsPage({ projectSlug: projectSlug! })}>
          Zurück zur Kontaktliste
        </Link>
      </p>
    </LayoutRs8>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
