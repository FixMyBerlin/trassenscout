import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { NewSubsubsectionForm } from "@/src/components/abschnitte/NewSubsubsectionForm"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new/",
)

export function PageAbschnitteFuehrungNew() {
  const { subsection } = routeApi.useLoaderData()
  return (
    <>
      <PageHeader breadcrumb={<AbschnitteBreadcrumb current="neu" />} />
      <Suspense fallback={<Spinner />}>
        <NewSubsubsectionForm subsection={subsection} />
      </Suspense>
    </>
  )
}
