import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminEvaluationsPageEditForm } from "@/src/components/admin/evaluations/edit/AdminEvaluationsPageEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/evaluations/$projectSlug/edit")

export function PageAdminEvaluationsProjectSlugEdit() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <AdminPageHeader
        parent={{ title: "Auswertungen-Seiten", href: "/admin/evaluations" }}
        title={projectSlug}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminEvaluationsPageEditForm projectSlug={projectSlug} />
      </Suspense>
    </>
  )
}
