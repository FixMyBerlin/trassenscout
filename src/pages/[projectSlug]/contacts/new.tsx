import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactForm, FORM_ERROR } from "src/contacts/components/ContactForm"
import createContact from "src/contacts/mutations/createContact"
import { ContactSchema } from "src/contacts/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"

const NewContactWithQuery: BlitzPage = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectId: project.id! })
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
    <>
      <MetaTags noindex title="Neuer Kontakt" />
      <PageHeader title="Neuer Kontakt" />
      <ContactForm
        submitText="Erstellen"
        schema={ContactSchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewContactPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
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
