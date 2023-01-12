import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, ProjectForm } from "src/projects/components/ProjectForm"
import updateProject from "src/projects/mutations/updateProject"
import getProject from "src/projects/queries/getProject"
import getUsers from "src/users/queries/getUsers"

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

  const [{ users }] = useQuery(getUsers, {})

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
      <MetaTags noindex title={`Project ${project.name} bearbeiten`} />

      <h1>Project {project.id} bearbeiten</h1>
      <pre>{JSON.stringify(project, null, 2)}</pre>

      <ProjectForm
        submitText="Speichern"
        // schema={ProjectSchema} // TODO add this
        initialValues={project}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const EditProjectPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditProject />
      </Suspense>

      <p>
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

EditProjectPage.authenticate = true

export default EditProjectPage
