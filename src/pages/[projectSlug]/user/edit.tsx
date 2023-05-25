import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import UserEditForm from "src/auth/components/UserEditForm"
import updateUser from "src/auth/mutations/updateUser"
import { UpdateUser } from "src/auth/validations"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoEditTitle } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR } from "src/projects/components/ProjectForm"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

type HandleSubmit = any // TODO
const EditUserWithQuery = () => {
  const router = useRouter()

  const user = useCurrentUser()
  const [updateUserMutation] = useMutation(updateUser)
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await updateUserMutation({ ...values })
      await router.push(Routes.Home())
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
