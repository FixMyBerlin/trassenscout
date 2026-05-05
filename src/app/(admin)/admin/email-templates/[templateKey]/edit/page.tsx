import { Breadcrumb } from "@/src/app/(admin)/admin/_components/Breadcrumb"
import { HeaderWrapper } from "@/src/app/(admin)/admin/_components/HeaderWrapper"
import { Metadata } from "next"
import { AdminEmailTemplateEditForm } from "./_components/AdminEmailTemplateEditForm"

export const metadata: Metadata = { title: "E-Mail-Template bearbeiten" }

export default function AdminEmailTemplateEditPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/email-templates", name: "E-Mail-Templates" },
            { href: "", name: "Bearbeiten" },
          ]}
        />
      </HeaderWrapper>

      <AdminEmailTemplateEditForm />
    </>
  )
}
