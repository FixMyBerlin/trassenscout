import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../../_components/Breadcrumb"
import { HeaderWrapper } from "../../../_components/HeaderWrapper"
import { AdminSurveyEditForm } from "./_components/AdminSurveyEditForm"

export const metadata: Metadata = { title: "Beteiligung bearbeiten erstellen" }

export default function AdminSurveyEditPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/surveys", name: "Beteiligungen" },
            { name: "Beteiligung bearbeiten" },
          ]}
        />
      </HeaderWrapper>

      <AdminSurveyEditForm />
    </>
  )
}
