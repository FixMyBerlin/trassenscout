import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createProject from "src/projects/mutations/createProject"
import { ProjectForm, FORM_ERROR } from "src/projects/components/ProjectForm"
import { Link } from "src/core/components/links"
import getUsers from "src/users/queries/getUsers"
import { Suspense } from "react"
import { ProjectSchema } from "src/projects/schema"

const NewProjectPageWithQuery = () => {
  const router = useRouter()
  const [createProjectMutation] = useMutation(createProject)

  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const project = await createProjectMutation(values)
      await router.push(Routes.ShowProjectPage({ projectId: project.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neue Radschnellverbindung erstellen" />

      <h1>Neue Radschnellverbindung erstellen</h1>

      <ProjectForm
        submitText="Erstellen"
        schema={ProjectSchema}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const NewProjectPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewProjectPageWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

NewProjectPage.authenticate = true

export default NewProjectPage
