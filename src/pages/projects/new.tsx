import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createProject from "src/projects/mutations/createProject"
import { ProjectForm, FORM_ERROR } from "src/projects/components/ProjectForm"
import { Link } from "src/core/components/links"

const NewProjectPage = () => {
  const router = useRouter()
  const [createProjectMutation] = useMutation(createProject)

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
    <LayoutArticle>
      <MetaTags noindex title="Neuen Project erstellen" />

      <h1>Neuen Project erstellen</h1>

      <ProjectForm
        submitText="Erstellen"
        // schema={ProjectSchema} // TODO add Schema
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />

      <p>
        <Link href={Routes.ProjectsPage()}>Alle Projects</Link>
      </p>
    </LayoutArticle>
  )
}

NewProjectPage.authenticate = true

export default NewProjectPage
