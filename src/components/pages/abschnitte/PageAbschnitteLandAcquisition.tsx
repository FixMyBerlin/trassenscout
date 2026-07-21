import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/components/abschnitte/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { MAP_FULLSCREEN_HEIGHT_CLASS } from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { MapPageSuspense } from "./_components/MapPageSuspense"

const layoutRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/_dashboard",
)

export function LandAcquisitionPrimaryAction() {
  const { projectSlug, subsectionSlug, subsubsectionSlug } = layoutRouteApi.useParams()

  return (
    <IfUserCanEdit>
      <Link
        button
        icon="plus"
        to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition/acquisition-areas/new"
        params={{ projectSlug, subsectionSlug, subsubsectionSlug }}
      >
        Weitere Verhandlungsflächen anlegen
      </Link>
    </IfUserCanEdit>
  )
}

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
      <div className="relative flex h-full min-h-0 w-full flex-col lg:flex-row lg:items-stretch">
        <aside className="min-h-0 w-full overflow-y-auto lg:h-full lg:w-[45%] lg:shrink-0">
          <SubsubsectionLandAcquisitionContent
            subsectionId={subsection.id}
            subsubsectionId={subsubsection.id}
            className="rounded-none border-0 shadow-none"
          />
          <SubsubsectionDeleteAllAcquisitionAreasAdmin
            projectSlug={projectSlug}
            subsectionSlug={subsectionSlug}
            subsubsectionSlug={subsubsectionSlug}
            subsubsectionId={subsubsection.id}
          />
          <SuperAdminLogData data={{ subsection, subsubsection }} />
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-gray-200 lg:border-t-0 lg:border-l">
          <SubsubsectionLandAcquisitionMap
            subsubsection={subsubsection}
            classHeight={MAP_FULLSCREEN_HEIGHT_CLASS}
          />
        </div>
      </div>
    </MapPageSuspense>
  )
}
