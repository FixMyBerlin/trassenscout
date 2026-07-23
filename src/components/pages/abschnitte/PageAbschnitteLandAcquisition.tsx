import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/components/abschnitte/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import {
  MAP_FULLSCREEN_HEIGHT_CLASS,
  MapAsideSplitLayout,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
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
      <MapAsideSplitLayout
        aside={
          <>
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
          </>
        }
        map={
          <SubsubsectionLandAcquisitionMap
            subsubsection={subsubsection}
            classHeight={MAP_FULLSCREEN_HEIGHT_CLASS}
          />
        }
      />
    </MapPageSuspense>
  )
}
