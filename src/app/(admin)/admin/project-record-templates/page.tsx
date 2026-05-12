import { AdminProjectRecordTemplatesTable } from "@/src/app/(admin)/admin/project-record-templates/_components/AdminProjectRecordTemplatesTable"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../_components/Breadcrumb"
import { HeaderWrapper } from "../_components/HeaderWrapper"
import getAdminProjectRecordTemplates from "@/src/server/projectRecordTemplates/queries/getAdminProjectRecordTemplates"

export const metadata: Metadata = { title: "Vorlagen Protokolleinträge" }

export default async function AdminProjectRecordTemplatesPage() {
  const templates = await invoke(getAdminProjectRecordTemplates, {})

  return (
    <>
      <HeaderWrapper className="mt-0">
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/project-record-templates", name: "Vorlagen Protokolleinträge" },
          ]}
        />
      </HeaderWrapper>

      <div className="not-prose mb-6">
        <Link button href="/admin/project-record-templates/new">
          Neue Vorlage erstellen
        </Link>
      </div>

      <AdminProjectRecordTemplatesTable initialTemplates={templates} />
    </>
  )
}
