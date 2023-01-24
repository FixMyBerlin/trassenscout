import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, ProjectForm } from "src/projects/components/ProjectForm"
import updateProject from "src/projects/mutations/updateProject"
import getProject from "src/projects/queries/getProject"
import { ProjectSchema } from "src/projects/schema"
import getUsers from "src/users/queries/getUsers"

const EditProjectWithQuery = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [project, { setQueryData }] = useQuery(
    getProject,
    { slug: projectSlug },
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
      await router.push(Routes.ProjectDashboardPage({ projectSlug: updated.slug }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Project ${quote(project.title)} bearbeiten`} />
      <PageHeader title={quote(project.title)} subtitle="Projekt bearbeiten" />
      <SuperAdminBox>
        <h1>Project {quote(project.title)} bearbeiten</h1>
        <pre>{JSON.stringify(project, null, 2)}</pre>

        <ProjectForm
          submitText="Speichern"
          schema={ProjectSchema}
          initialValues={project}
          onSubmit={handleSubmit}
          users={users}
        />
      </SuperAdminBox>
    </>
  )
}

const EditProjectPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditProjectWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.ProjectDashboardPage({ projectSlug: projectSlug! })}>
          Zurück zum Projekt
        </Link>
      </p>
    </LayoutRs>
  )
}

EditProjectPage.authenticate = true

export default EditProjectPage
