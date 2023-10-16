import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
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

const AdminNewMembership = () => {
  const router = useRouter()

  const [createMembershipMutation] = useMutation(createMembership)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createMembershipMutation({ ...values })
      await router.push(Routes.AdminMembershipsPage())
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <SuperAdminBox>
      <MembershipForm
        initialValues={{ userId: router.query.userId }}
        submitText="Erstellen"
        onSubmit={handleSubmit}
      />
    </SuperAdminBox>
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

AdminNewMembershipPage.authenticate = { role: "ADMIN" }

export default AdminNewMembershipPage
