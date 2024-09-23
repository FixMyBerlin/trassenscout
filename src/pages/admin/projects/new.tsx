import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"
import createMembership from "@/src/memberships/mutations/createMembership"
import { FORM_ERROR, ProjectForm } from "@/src/projects/components/ProjectForm"
import createProject from "@/src/projects/mutations/createProject"
import { ProjectLogoScrcsInputSchema, ProjectSchema } from "@/src/projects/schema"
import { useCurrentUser } from "@/src/users/hooks/useCurrentUser"
import getUsers from "@/src/users/queries/getUsers"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const AdminNewProject = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [createProjectMutation] = useMutation(createProject)
  const [createMembershipMutation] = useMutation(createMembership)

  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs.split("\n")
    values = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      const project = await createProjectMutation(values)

      // Create a membership for the selected user
      if (project.managerId) {
        try {
          await createMembershipMutation({
            projectId: project.id,
            userId: project.managerId,
            role: "EDITOR",
          })
        } catch (error: any) {
          console.error(error)
          return { [FORM_ERROR]: error }
        }
      }

      await router.push(Routes.ProjectDashboardPage({ projectSlug: project.slug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
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
        <AdminNewProject />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link href="/dashboard">Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

AdminNewProjectPage.authenticate = { role: "ADMIN" }

export default AdminNewProjectPage
