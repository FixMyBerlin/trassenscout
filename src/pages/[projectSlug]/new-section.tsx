import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import { FORM_ERROR, SectionForm } from "src/sections/components/SectionForm"
import createSection from "src/sections/mutations/createSection"
import { SectionSchema } from "src/sections/schema"
import getUsers from "src/users/queries/getUsers"

const NewSectionWithQuery = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [createSectionMutation] = useMutation(createSection)
  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const section = await createSectionMutation({ ...values, projectId: project.id! })
      await router.push(
        Routes.SectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: section.slug,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neue Teilstrecke erstellen" />

      <h1>Neue Teilstrecke erstellen</h1>

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
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewSectionWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.ProjectDashboardPage({ projectSlug: projectSlug! })}>Zum Projekt</Link>
      </p>
    </LayoutArticle>
  )
}

NewSectionPage.authenticate = true

export default NewSectionPage
