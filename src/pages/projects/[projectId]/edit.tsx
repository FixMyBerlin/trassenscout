import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"
import updateProject from "src/projects/mutations/updateProject"
import { ProjectForm, FORM_ERROR } from "src/projects/components/ProjectForm"
import { Link } from "src/core/components/links"

const EditProject = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [project, { setQueryData }] = useQuery(
    getProject,
    { id: projectId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateProjectMutation] = useMutation(updateProject)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateProjectMutation({
        id: project.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowProjectPage({ projectId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <h1>Project {project.id} bearbeiten</h1>
      <pre>{JSON.stringify(project, null, 2)}</pre>

      <ProjectForm
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/createProject.ts to `Project/schema.ts`
        //   - Name `ProjectSchema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/updateProject.ts to
        //   `const UpdateProjectSchema = ProjectSchema.merge(z.object({id: z.number(),}))`
        // schema={ProjectSchema}
        initialValues={project}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditProjectPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={`Project ${project.title} bearbeiten`} />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditProject />
      </Suspense>

      <p>
        <Link href={Routes.Home()}>Alle Projects</Link>
      </p>
    </LayoutArticle>
  )
}

EditProjectPage.authenticate = true

export default EditProjectPage
