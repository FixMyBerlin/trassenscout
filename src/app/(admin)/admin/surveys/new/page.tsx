import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"
import { AdminSurveyNewForm } from "./_components/AdminSurveyNewForm"

export const metadata: Metadata = { title: "Neue Beteiligung erstellen" }

export default function AdminSurveyNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/surveys", name: "Beteiligungen" },
            { name: "Neue Beteiligung erstellen" },
          ]}
        />
      </HeaderWrapper>

      <AdminSurveyNewForm />
    </>
  )
}
