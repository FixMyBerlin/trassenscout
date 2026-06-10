import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { NewAcquisitionAreasForm } from "@/src/components/abschnitte/acquisition-areas/NewAcquisitionAreasForm"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { MapPageSuspense } from "./_components/MapPageSuspense"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new/",
)

export function PageAbschnitteAcquisitionAreaNew() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = routeApi.useParams()
  const { data: subsubsection } = useSuspenseQuery(
    subsubsectionBySlugQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
  )
  return (
    <>
      <PageHeader title="Verhandlungsflächen des Eintrags erstellen" />
      <MapPageSuspense>
        <NewAcquisitionAreasForm initialSubsubsection={subsubsection} />
      </MapPageSuspense>
    </>
  )
}
