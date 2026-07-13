import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { UserEditForm } from "@/src/components/user/UserEditForm"

export function PageUserEdit() {
  return (
    <>
      <PageHeader title="Profil bearbeiten" />
      <UserEditForm />
    </>
  )
}
