import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoEditTitleSlug, shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, ProjectForm } from "src/projects/components/ProjectForm"
import updateProject from "src/projects/mutations/updateProject"
import getProject from "src/projects/queries/getProject"
import { ProjectLogoScrcsInputSchema, ProjectSchema } from "src/projects/schema"
import getProjectUsers from "src/memberships/queries/getProjectUsers"

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
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs.split("\n")
    values = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }

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
      <MetaTags noindex title={seoEditTitleSlug(project.slug)} />
      <PageHeader title="Projekt bearbeiten" className="mt-12" />

      <ProjectForm
        className="mt-10"
        submitText="Speichern"
        schema={ProjectSchema.merge(ProjectLogoScrcsInputSchema)}
        initialValues={{ ...project, partnerLogoSrcs: project.partnerLogoSrcs.join("\n") }}
        onSubmit={handleSubmit}
        users={users}
      />

      <SuperAdminLogData data={project} />
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
