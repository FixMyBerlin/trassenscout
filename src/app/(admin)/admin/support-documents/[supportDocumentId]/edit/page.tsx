import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../../_components/Breadcrumb"
import { HeaderWrapper } from "../../../_components/HeaderWrapper"
import { AdminSupportDocumentEditForm } from "./_components/AdminSupportDocumentEditForm"

export const metadata: Metadata = { title: "Dokument bearbeiten" }

export default function AdminSupportDocumentEditPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/support", name: "Dokumente" },
            { name: "Dokument bearbeiten" },
          ]}
        />
      </HeaderWrapper>

      <AdminSupportDocumentEditForm />
    </>
  )
}
