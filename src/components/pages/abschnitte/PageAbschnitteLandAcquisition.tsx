import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import { SubsubsectionDeleteAllAcquisitionAreasAdmin } from "@/src/components/abschnitte/SubsubsectionDeleteAllAcquisitionAreasAdmin"
import { SubsubsectionLandAcquisitionContent } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionContent"
import { SubsubsectionLandAcquisitionMap } from "@/src/components/abschnitte/SubsubsectionLandAcquisitionMap"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import {
  MAP_FULLSCREEN_HEIGHT_CLASS,
  MapAsideSplitLayout,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { hasGeometry } from "@/src/shared/geometry/hasGeometry"
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

  if (!hasGeometry(subsubsection)) {
    return (
      <div className="p-4">
        <Notice type="info" title="Diese Maßnahme hat keine Geometrie.">
          Für den Grunderwerb braucht die Maßnahme eine Geometrie. Zeichnen Sie sie unter
          „bearbeiten“ ein.
        </Notice>
      </div>
    )
  }

  return (
    <MapPageSuspense>
      <MapProvider>
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
      </MapProvider>
    </MapPageSuspense>
  )
}
