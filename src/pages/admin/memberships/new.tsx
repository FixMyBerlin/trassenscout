import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { MembershipForm } from "src/memberships/components/MembershipForm"
import createMembership from "src/memberships/mutations/createMembership"
import { FORM_ERROR } from "src/projects/components/ProjectForm"
import getProjectsIdAndName from "src/projects/queries/getProjectsIdAndName"
import getAdminStatus from "src/users/queries/getAdminStatus"
import getUsers from "src/users/queries/getUsers"

const AdminNewMembership = () => {
  useQuery(getAdminStatus, {}) // See https://github.com/FixMyBerlin/private-issues/issues/936

  const router = useRouter()

  const [createMembershipMutation] = useMutation(createMembership)
  const [{ users }] = useQuery(getUsers, {})
  const [{ projects }] = useQuery(getProjectsIdAndName, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const membership = createMembershipMutation({ ...values })
      await router.push(Routes.AdminMembershipsPage())
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <SuperAdminBox>
        <MembershipForm
          submitText="Erstellen"
          onSubmit={handleSubmit}
          users={users}
          projects={projects}
        />
      </SuperAdminBox>
    </>
  )
}

const AdminNewMembershipPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={seoNewTitle("Trasse")} />
      <PageHeader title="Rechte auf Trasse vergeben / Membership hinzufügen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <AdminNewMembership />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link href={Routes.Home()}>Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

// See https://github.com/FixMyBerlin/private-issues/issues/936
// AdminNewMembershipPage.authenticate = { role: "ADMIN" }
AdminNewMembershipPage.authenticate = true

export default AdminNewMembershipPage
