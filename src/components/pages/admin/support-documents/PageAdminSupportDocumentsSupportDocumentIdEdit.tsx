import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSupportDocumentEditForm } from "@/src/components/admin/support-documents/[supportDocumentId]/edit/AdminSupportDocumentEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/support-documents/$supportDocumentId/edit/")

export function PageAdminSupportDocumentsSupportDocumentIdEdit() {
  const { supportDocumentId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Support-Dokumente", href: "/admin/support-documents" }}
        title={`Dokument ${supportDocumentId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminSupportDocumentEditForm supportDocumentId={Number(supportDocumentId)} />
      </Suspense>
    </>
  )
}
