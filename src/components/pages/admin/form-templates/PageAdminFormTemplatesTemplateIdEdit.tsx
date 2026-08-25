import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminFormTemplateEditForm } from "@/src/components/admin/form-templates/[templateId]/edit/AdminFormTemplateEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/form-templates/$templateId/edit/")

export function PageAdminFormTemplatesTemplateIdEdit() {
  const { templateId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Vorlagen Formulare", href: "/admin/form-templates" }}
        title={`Formulartemplate ${templateId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminFormTemplateEditForm templateId={Number(templateId)} />
      </Suspense>
    </>
  )
}
