import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"
import { MembershipForm } from "@/src/memberships/components/MembershipForm"
import createMembership from "@/src/memberships/mutations/createMembership"
import { MembershipSchema } from "@/src/memberships/schema"
import { FORM_ERROR } from "@/src/pagesComponents/projects/ProjectForm"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const AdminNewMembership = () => {
  const router = useRouter()

  const [createMembershipMutation] = useMutation(createMembership)

  type HandleSubmit = z.infer<typeof MembershipSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createMembershipMutation(values)
      await router.push(Routes.AdminMembershipsPage())
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <SuperAdminBox>
      <MembershipForm
        initialValues={{
          userId: router.query.userId ? Number(router.query.userId) : undefined,
        }}
        schema={MembershipSchema}
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
        <Link href="/dashboard">Startseite</Link>
      </p>
    </LayoutArticle>
  )
}

AdminNewMembershipPage.authenticate = { role: "ADMIN" }

export default AdminNewMembershipPage
