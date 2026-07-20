import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { AbschnitteBreadcrumb } from "@/src/components/abschnitte/AbschnitteBreadcrumb"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { SubsubsectionMapWithProvider } from "@/src/components/core/components/Map/SubsubsectionMapWithProvider"
import {
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/pages/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import type { SubsectionsList } from "@/src/server/subsections/types"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { SubsubsectionTable } from "./SubsubsectionTable"

const subsectionRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/",
)

type Subsection = SubsectionsList[number]

function SubsectionDashboardContent({
  projectSlug,
  subsectionSlug,
  subsection,
  subsections,
}: {
  projectSlug: string
  subsectionSlug: string
  subsection: Subsection
  subsections: SubsectionsList
}) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const isMapMode = viewMode === "map"
  const { data: subsubsections } = useSuspenseQuery(
    subsubsectionsQueryOptions({ projectSlug, subsectionId: subsection.id }),
  )

  return (
    <div className={twJoin(isMapMode && MAP_VIEWPORT_SHELL_CLASS)}>
      <PageHeader
        className={isMapMode ? "mb-0 shrink-0" : undefined}
        breadcrumb={<AbschnitteBreadcrumb />}
        info="Übersicht über alle Maßnahmen dieses Planungsabschnitts."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              to="/$projectSlug/abschnitte/$subsectionSlug/edit"
              params={{ projectSlug, subsectionSlug }}
            >
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        primaryAction={
          <Link
            button
            to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new"
            params={{ projectSlug, subsectionSlug }}
          >
            Neue Maßnahme
          </Link>
        }
      />

      <MapListViewLayout
        mode={viewMode}
        map={(classHeight) => (
          <SubsubsectionMapWithProvider
            key="map-subsection"
            projectSlug={projectSlug}
            subsectionSlug={subsectionSlug}
            subsections={subsections}
            selectedSubsection={subsection}
            subsubsections={subsubsections}
            clusterSubsubsections
            classHeight={classHeight}

          />
        )}
        list={<SubsubsectionTable subsubsections={subsubsections} compact={false} />}
      >
        <SuperAdminLogData data={{ subsections, subsection, subsubsections }} />
      </MapListViewLayout>
    </div>
  )
}

export const SubsectionDashboardClient = () => {
  const { projectSlug, subsectionSlug } = subsectionRouteApi.useParams()
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))
  const subsection = subsections.find((ss) => ss.slug === subsectionSlug)

  if (!subsection) return null

  return (
    <SubsectionDashboardContent
      projectSlug={projectSlug}
      subsectionSlug={subsectionSlug}
      subsection={subsection}
      subsections={subsections}
    />
  )
}
