import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { Link } from "@/src/components/core/components/links/Link"
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
      <div className="relative flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="w-full min-w-0 lg:flex-1">
          <SubsubsectionLandAcquisitionMap subsubsection={subsubsection} />
        </div>
        <div className="w-full min-w-0 lg:flex-1">
          <SubsubsectionLandAcquisitionContent
            subsectionId={subsection.id}
            subsubsectionId={subsubsection.id}
          />
        </div>
      </div>
    </MapPageSuspense>
  )
}
