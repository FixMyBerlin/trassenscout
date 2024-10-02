import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutArticle, MetaTags } from "@/src/core/layouts"
import { FORM_ERROR } from "@/src/pagesComponents/projects/ProjectForm"
import updateUser from "@/src/server/auth/mutations/updateUser"
import { UpdateUser } from "@/src/server/auth/schema"
import { UserEditForm } from "@/src/users/components/UserEditForm"
import { useCurrentUser } from "@/src/users/hooks/useCurrentUser"
import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

type HandleSubmit = any // TODO
const EditUserWithQuery = () => {
  const router = useRouter()

  const user = useCurrentUser()
  const [updateUserMutation] = useMutation(updateUser)
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateUserMutation(values)
      await router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <UserEditForm
        submitText="Speichern"
        schema={UpdateUser}
        initialValues={user!}
        onSubmit={handleSubmit}
      />

      <SuperAdminLogData data={user} />
    </>
  )
}

const EditUserPage: BlitzPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title={seoEditTitle("Profil")} />
      <PageHeader title="Profil bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditUserWithQuery />
      </Suspense>
    </LayoutArticle>
  )
}

EditUserPage.authenticate = true

export default EditUserPage
