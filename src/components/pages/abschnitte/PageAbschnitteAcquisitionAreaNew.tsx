import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { NewAcquisitionAreasForm } from "@/src/components/abschnitte/acquisition-areas/NewAcquisitionAreasForm"
import { MAP_VIEWPORT_SHELL_CLASS } from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
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
    <div className={MAP_VIEWPORT_SHELL_CLASS}>
      <PageHeader
        breadcrumb={<AbschnitteBreadcrumb current="Grunderwerb" />}
        info="Erstellen Sie automatisch neue Verhandlungsflächen durch einen räumlichen Abgleich mit den ALKIS-Flurstücken."
        title="Verhandlungsflächen erstellen"
        className="mb-0 shrink-0"
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MapPageSuspense>
          <div className="h-full min-h-0">
            <NewAcquisitionAreasForm initialSubsubsection={subsubsection} />
          </div>
        </MapPageSuspense>
      </div>
    </div>
  )
}
