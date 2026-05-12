import { AdminProjectRecordTemplateNewForm } from "@/src/app/(admin)/admin/project-record-templates/new/_components/AdminProjectRecordTemplateNewForm"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../../_components/Breadcrumb"
import { HeaderWrapper } from "../../_components/HeaderWrapper"

export const metadata: Metadata = { title: "Neue Vorlage erstellen" }

export default function AdminProjectRecordTemplateNewPage() {
  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/project-record-templates", name: "Vorlagen Protokolleinträge" },
            { href: "/admin/project-record-templates/new", name: "Neue Vorlage erstellen" },
          ]}
        />
      </HeaderWrapper>

      <AdminProjectRecordTemplateNewForm />
    </>
  )
}
