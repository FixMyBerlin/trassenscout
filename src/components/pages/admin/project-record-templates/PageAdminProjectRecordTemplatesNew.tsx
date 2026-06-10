import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminProjectRecordTemplateNewForm } from "@/src/components/admin/project-record-templates/new/AdminProjectRecordTemplateNewForm"

export function PageAdminProjectRecordTemplatesNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Vorlagen Protokolleinträge", href: "/admin/project-record-templates" }}
        title="Neues Template"
      />
      <AdminProjectRecordTemplateNewForm />
    </>
  )
}
