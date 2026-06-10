import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { MembershipNewForm } from "@/src/components/admin/memberships/new/MembershipNewForm"

export function PageAdminMembershipsNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Nutzer & Rechte", href: "/admin/memberships" }}
        title="Neue Mitgliedschaft"
      />
      <MembershipNewForm />
    </>
  )
}
