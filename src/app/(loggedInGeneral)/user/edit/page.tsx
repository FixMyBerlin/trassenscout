import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Metadata } from "next"
import "server-only"
import { UserEditForm } from "./_components/UserEditForm"

export const metadata: Metadata = {
  title: "Profil bearbeiten",
}

export default function EditUserPage() {
  return (
    <>
      <PageHeader title="Profil bearbeiten" className="mt-12" />
      <UserEditForm />
    </>
  )
}
