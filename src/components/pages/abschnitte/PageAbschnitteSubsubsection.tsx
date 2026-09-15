import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SubsubsectionDetailsContent } from "@/src/components/abschnitte/SubsubsectionDetailsContent"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import { GeometryErrorNotice } from "@/src/components/core/components/Notice/GeometryErrorNotice"
import {
  MAP_FULLSCREEN_HEIGHT_CLASS,
  MapAsideSplitLayout,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { subsectionBySlugQueryOptions } from "@/src/server/subsections/subsectionQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionBySlugQueryOptions } from "@/src/server/subsubsections/subsubsectionQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { brokenGeometryItems } from "@/src/shared/geometry/brokenGeometryItems"
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
      <MapAsideSplitLayout
        aside={
          <>
            <SubsubsectionDetailsContent
              subsubsection={subsubsection}
              className="rounded-none border-0 shadow-none"
            />
            <GeometryErrorNotice
              items={brokenGeometryItems(subsubsections)}
              labelSingular="Maßnahme"
              labelPlural="Maßnahmen"
            />
            <SuperAdminLogData data={{ subsection, subsubsection }} />
          </>
        }
        map={
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
        }
      />
    </MapPageSuspense>
  )
}
