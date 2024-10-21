import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"
import { MembershipNewForm } from "./_components/MembershipNewForm"

export const metadata: Metadata = { title: "Mitglieschaft anlegen" }

export default function AdminMembershipNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/memberships", name: "Nutzer & Mitgliedschaften" },
            { href: "/admin/memberships/new", name: "Mitgliedschaft anlegen" },
          ]}
        />
      </HeaderWrapper>

      <MembershipNewForm />
    </>
  )
}
