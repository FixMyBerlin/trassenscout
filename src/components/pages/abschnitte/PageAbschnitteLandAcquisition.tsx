import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { MapPageSuspense } from "./_components/MapPageSuspense"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

export function PageAbschnitteLandAcquisition() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const { data: subsection } = useSuspenseQuery(
    subsectionBySlugQueryOptions({ projectSlug, subsectionSlug }),
  )
  const { data: subsubsection } = useSuspenseQuery(
    subsubsectionBySlugQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
  )

  return (
    <MapPageSuspense>
      <div className="relative flex w-full items-start gap-6">
        <div className="min-w-0 flex-1">
          <SubsubsectionLandAcquisitionMap subsubsection={subsubsection} />
        </div>
        <div className="min-w-0 flex-1">
          <SubsubsectionLandAcquisitionContent
            subsectionId={subsection.id}
            subsubsectionId={subsubsection.id}
          />
        </div>
      </div>
    </MapPageSuspense>
  )
}
