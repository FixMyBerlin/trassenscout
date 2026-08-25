import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminFormTemplateNewForm } from "@/src/components/admin/form-templates/new/AdminFormTemplateNewForm"

export function PageAdminFormTemplatesNew() {
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Vorlagen Formulare", href: "/admin/form-templates" }}
        title="Neues Formulartemplate"
      />
      <AdminFormTemplateNewForm />
    </>
  )
}
