import { Breadcrumb, BreadcrumbStep } from "@/src/components/core/components/PageHeader/Breadcrumb"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { UserEditForm } from "@/src/components/user/UserEditForm"

export function PageUserEdit() {
  return (
    <>
      <PageHeader title="Profil bearbeiten" />
      <UserEditForm />
    </>
  )
}
