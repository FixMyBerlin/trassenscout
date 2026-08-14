import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { UserEditForm } from "@/src/components/user/UserEditForm"

export function PageUserEdit() {
  return (
    <>
      <PageHeader
        title="Profil bearbeiten"
        info="Hier können Sie Ihre persönlichen Profildaten bearbeiten. Diese werden nach dem Speichern für alle Projektmitglieder sichtbar."
      />
      <UserEditForm />
    </>
  )
}
