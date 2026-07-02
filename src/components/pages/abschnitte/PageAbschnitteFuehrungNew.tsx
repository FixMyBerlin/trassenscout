import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { NewSubsubsectionForm } from "@/src/components/abschnitte/NewSubsubsectionForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new/",
)

export function PageAbschnitteFuehrungNew() {
  const { subsection } = routeApi.useLoaderData()
  return (
    <>
      <PageHeader title="Neue Maßnahme  hinzufügen" subtitle={subsection.slug} />
      <Suspense fallback={<Spinner />}>
        <NewSubsubsectionForm subsection={subsection} />
      </Suspense>
    </>
  )
}
