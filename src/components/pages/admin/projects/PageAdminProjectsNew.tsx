import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminProjectsNewForm } from "@/src/components/admin/projects/new/AdminProjectsNewForm"

export function PageAdminProjectsNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Alle Projekte", href: "/admin/projects" }}
        title="Neues Projekt"
      />
      <AdminProjectsNewForm />
    </>
  )
}
