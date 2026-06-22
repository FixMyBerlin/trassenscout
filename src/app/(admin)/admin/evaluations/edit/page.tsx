import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { Metadata } from "next"
import { AdminEvaluationsPageEditForm } from "./_components/AdminEvaluationsPageEditForm"

export const metadata: Metadata = { title: "Auswertungen-Seite bearbeiten" }

export default function AdminEvaluationsPageEditPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/evaluations/edit", name: "Auswertungen-Seite" },
          ]}
        />
      </HeaderWrapper>

      <AdminEvaluationsPageEditForm />
    </>
  )
}
