import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoNewTitle } from "src/core/components/text"
import { H1 } from "src/core/components/text/Headings"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, ProjectForm } from "src/projects/components/ProjectForm"
import createProject from "src/projects/mutations/createProject"
import { ProjectLogoScrcsInputSchema, ProjectSchema } from "src/projects/schema"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import getUsers from "src/users/queries/getUsers"

const AdminNewProjectPageWithQuery = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [createProjectMutation] = useMutation(createProject)

  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs.split("\n")
    values = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      const project = await createProjectMutation(values)
      await router.push(Routes.ProjectDashboardPage({ projectSlug: project.slug }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <SuperAdminBox>
        <ProjectForm
          submitText="Erstellen"
          schema={ProjectSchema.merge(ProjectLogoScrcsInputSchema)}
          initialValues={{ managerId: currentUser!.id }}
          onSubmit={handleSubmit}
          users={users}
        />
      </SuperAdminBox>
    </>
  )
}

const AdminNewProjectPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={seoNewTitle("Trasse")} />
      <PageHeader title="Trasse hinzufügen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <AdminNewProjectPageWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

AdminNewProjectPage.authenticate = true

export default AdminNewProjectPage
