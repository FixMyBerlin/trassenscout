import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDetailsContent } from "@/src/components/abschnitte/SubsubsectionDetailsContent"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { MAP_FULLSCREEN_HEIGHT_CLASS } from "@/src/components/core/components/pages/MapListViewLayout"
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
      <div className="relative flex h-full min-h-0 w-full flex-col lg:flex-row lg:items-stretch">
        <aside className="min-h-0 w-full overflow-y-auto lg:h-full lg:w-[45%] lg:shrink-0">
          <SubsubsectionDetailsContent
            subsubsection={subsubsection}
            className="rounded-none border-0 shadow-none"
          />
          <SuperAdminLogData data={{ subsection, subsubsection }} />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-200 lg:border-t-0 lg:border-l">
          <SubsubsectionMapWithProvider
            key={`map-subsubsection-${subsubsectionSlug}`}
            projectSlug={projectSlug}
            subsectionSlug={subsectionSlug}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
            selectedSubsubsectionSlug={subsubsectionSlug}
            classHeight={MAP_FULLSCREEN_HEIGHT_CLASS}
          />
        </div>
      </div>
    </MapPageSuspense>
  )
}
