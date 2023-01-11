import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import createContact from "src/contacts/mutations/createContact"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import { Link } from "src/core/components/links"
import { ContactSchema } from "src/contacts/schema"
import { PageHeader } from "src/core/components/PageHeader"

const NewContactPage = () => {
  const router = useRouter()
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation(values)
      await router.push(Routes.ShowContactPage({ contactId: contact.id }))
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
      <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />

      <p className="mt-5">
        <Link href={Routes.ContactsPage()}>Zurück zur Kontaktliste</Link>
      </p>
    </LayoutRs8>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
