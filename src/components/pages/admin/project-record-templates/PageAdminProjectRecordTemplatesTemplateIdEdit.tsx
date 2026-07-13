import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminProjectRecordTemplateEditForm } from "@/src/components/admin/project-record-templates/[templateId]/edit/AdminProjectRecordTemplateEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/project-record-templates/$templateId/edit/")

export function PageAdminProjectRecordTemplatesTemplateIdEdit() {
  const { templateId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Vorlagen Protokolleinträge", href: "/admin/project-record-templates" }}
        title={`Template ${templateId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminProjectRecordTemplateEditForm templateId={Number(templateId)} />
      </Suspense>
    </>
  )
}
