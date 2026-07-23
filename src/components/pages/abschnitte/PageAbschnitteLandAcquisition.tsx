import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/components/abschnitte/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import {
  MAP_FULLSCREEN_HEIGHT_CLASS,
  MapAsideSplitLayout,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
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
