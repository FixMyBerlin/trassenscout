import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminSubsubsectionExtraFieldsEditForm } from "@/src/components/admin/subsubsection-extra-fields/AdminSubsubsectionExtraFieldsEditForm"
import { Spinner } from "@/src/components/core/components/Spinner"
import { shortTitle } from "@/src/components/core/components/text/titles"

const routeApi = getRouteApi("/admin/projects/$projectSlug/subsubsection-extra-fields/")

export function PageAdminSubsubsectionExtraFieldsProjectSlugEdit() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <AdminPageHeader title={shortTitle(projectSlug)} />
      <Suspense fallback={<Spinner page />}>
        <AdminSubsubsectionExtraFieldsEditForm projectSlug={projectSlug} />
      </Suspense>
    </>
  )
}
