import { AdminProjectRecordTemplateEditForm } from "@/src/app/(admin)/admin/project-record-templates/[templateId]/edit/_components/AdminProjectRecordTemplateEditForm"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../../_components/Breadcrumb"
import { HeaderWrapper } from "../../../_components/HeaderWrapper"

export const metadata: Metadata = { title: "Vorlage bearbeiten" }

export default function AdminProjectRecordTemplateEditPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/project-record-templates", name: "Vorlagen Protokolleinträge" },
            { name: "Vorlage bearbeiten" },
          ]}
        />
      </HeaderWrapper>

      <AdminProjectRecordTemplateEditForm />
    </>
  )
}
