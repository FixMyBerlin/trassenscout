import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createContact from "src/contacts/mutations/createContact"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import { Link } from "src/core/components/links"
import { ContactSchema } from "src/contacts/schema"

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
    <LayoutArticle>
      <MetaTags noindex title="Neuen Kontakt erstellen" />
      <h1>Neuen Kontakt erstellen</h1>

      <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />

      <p>
        <Link href={Routes.ContactsPage()}>Alle Kontakte</Link>
      </p>
    </LayoutArticle>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
