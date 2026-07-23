import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { EditSubsubsectionForm } from "@/src/components/abschnitte/EditSubsubsectionForm"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit/",
)

export function PageAbschnitteSubsubsectionEdit() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = routeApi.useParams()
  const { data: subsubsection } = useSuspenseQuery(
    subsubsectionBySlugQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
  )
  return (
    <>
      <PageHeader breadcrumb={<AbschnitteBreadcrumb current="bearbeiten" />} />
      <Suspense fallback={<Spinner />}>
        <EditSubsubsectionForm subsubsection={subsubsection} />
      </Suspense>
      <div className={pageContentPaddingClassName}>
        <SuperAdminLogData data={subsubsection} />
      </div>
    </>
  )
}
