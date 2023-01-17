import { ErrorBoundary, Routes } from "@blitzjs/next"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createSection from "src/sections/mutations/createSection"
import { SectionForm, FORM_ERROR } from "src/sections/components/SectionForm"
import { Link } from "src/core/components/links"
import { SectionSchema } from "src/sections/schema"
import getUsers from "src/users/queries/getUsers"
import { Suspense } from "react"

const NewSection = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [createSectionMutation] = useMutation(createSection)

  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const section = await createSectionMutation({ ...values, projectId: projectId! })
      await router.push(
        Routes.ShowSectionPage({
          projectId: projectId!,
          sectionId: section.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Section erstellen" />

      <h1>Neuen Section erstellen</h1>

      <SectionForm
        submitText="Erstellen"
        schema={SectionSchema.omit({ projectId: true })}
        // initialValues={}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const NewSectionPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewSection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectId: projectId! })}>Alle Sections</Link>
      </p>
    </LayoutArticle>
  )
}

NewSectionPage.authenticate = true

export default NewSectionPage
