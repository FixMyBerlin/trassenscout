import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import createContact from "src/contacts/mutations/createContact"
import { ContactSchema } from "src/contacts/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoNewTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"

const NewContactWithQuery: BlitzPage = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectSlug: projectSlug! })
      await router.push(
        Routes.ShowContactPage({
          projectSlug: projectSlug!,
          contactId: contact.id,
        }),
      )
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        // This error comes from Prisma
        return {
          email:
            "Diese E-Mail-Adresse ist bereits vergeben. Eine E-Mail-Adresse darf nur einem Kontakt zugewiesen werden.",
        }
      } else {
        return { [FORM_ERROR]: error }
      }
    }
  }

  return (
    <>
      <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />
    </>
  )
}

const NewContactPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Kontakt")} />
      <PageHeader title="Neuer Kontakt" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewContactWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.ContactsPage({ projectSlug: projectSlug! })}>
          Zurück zur Kontaktliste
        </Link>
      </p>
    </LayoutRs>
  )
}

NewContactPage.authenticate = true

export default NewContactPage
