import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDetailsContent } from "@/src/components/abschnitte/SubsubsectionDetailsContent"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { MapPageSuspense } from "./_components/MapPageSuspense"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

export function PageAbschnitteSubsubsection() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()
  const { data: subsection } = useSuspenseQuery(
    subsectionBySlugQueryOptions({ projectSlug, subsectionSlug }),
  )
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const { data: subsubsection } = useSuspenseQuery(
    subsubsectionBySlugQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
  )
  const { data: subsubsections } = useSuspenseQuery(
    subsubsectionsQueryOptions({ projectSlug, subsectionId: subsection.id }),
  )

  return (
    <MapPageSuspense>
      <div className="relative flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 w-full lg:flex-1">
          <SubsubsectionMapWithProvider
            key={`map-subsubsection-${subsubsectionSlug}`}
            projectSlug={projectSlug}
            subsectionSlug={subsectionSlug}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
            selectedSubsubsectionSlug={subsubsectionSlug}
          />
        </div>
        <div className="min-w-0 w-full lg:flex-1">
          <SubsubsectionDetailsContent subsubsection={subsubsection} />
        </div>
      </div>
    </MapPageSuspense>
  )
}
