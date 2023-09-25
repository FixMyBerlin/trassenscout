import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoNewTitle } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createMembership from "src/memberships/mutations/createMembership"
import { FORM_ERROR, ProjectForm } from "src/projects/components/ProjectForm"
import createProject from "src/projects/mutations/createProject"
import { ProjectLogoScrcsInputSchema, ProjectSchema } from "src/projects/schema"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import getAdminStatus from "src/users/queries/getAdminStatus"
import getUsers from "src/users/queries/getUsers"

const AdminNewProject = () => {
  useQuery(getAdminStatus, {}) // See https://github.com/FixMyBerlin/private-issues/issues/936

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
      const project = await createProjectMutation({
        ...values,
        // The value="" becomes "0" which we translate to NULL
        managerId: values.managerId === 0 ? null : values.managerId,
      })

      // Create a membership for the selected user
      if (project.managerId) {
        try {
          await createMembershipMutation({ projectId: project.id, userId: project.managerId })
        } catch (error: any) {
          console.error(error)
          return { [FORM_ERROR]: error }
        }
      }

      await router.push(Routes.ProjectDashboardPage({ projectSlug: project.slug }))
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
        // This error comes from Prisma
        return {
          slug: "Dieses URL-Segment ist bereits für eine andere Trasse vergeben. Ein URL-Segment darf nur einmalig zugewiesen werden.",
        }
      } else {
        return { [FORM_ERROR]: error }
      }
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
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

// See https://github.com/FixMyBerlin/private-issues/issues/936
// AdminNewProjectPage.authenticate = { role: "ADMIN" }
AdminNewProjectPage.authenticate = true

export default AdminNewProjectPage
