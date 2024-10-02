import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { ContactForm, FORM_ERROR } from "@/src/pagesComponents/contacts/ContactForm"
import createContact from "@/src/server/contacts/mutations/createContact"
import { ContactSchema } from "@/src/server/contacts/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewContactWithQuery: BlitzPage = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectSlug })
      await router.push(
        Routes.ShowContactPage({
          projectSlug,
          contactId: contact.id,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />
    </>
  )
}

const NewContactPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Kontakt")} />
      <PageHeader title="Neuer Kontakt" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewContactWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.ContactsPage({ projectSlug })}>Zurück zur Kontaktliste</Link>
      </p>
    </LayoutRs>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
