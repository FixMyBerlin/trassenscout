import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useState } from "react"
import { MapProvider } from "react-map-gl/maplibre"
import { twJoin } from "tailwind-merge"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { Link } from "@/src/components/core/components/links/Link"
import { ProjectMap } from "@/src/components/core/components/Map/ProjectMap"
import { ProjectMapFallback } from "@/src/components/core/components/Map/ProjectMapFallback"
import {
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { OperatorFilter } from "./OperatorFilter"
import { SubsectionTable } from "./SubsectionTable"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/")

export const ProjectDashboardClient = () => {
  const { projectSlug } = routeApi.useParams()
  const { operator: operatorParam } = routeApi.useSearch()
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const isMapMode = viewMode === "map"

  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const { data: subsections } = useSuspenseQuery(subsectionsQueryOptions({ projectSlug }))

  const filteredSubsections = operatorParam
    ? subsections.filter((sec) => sec.operator?.slug === operatorParam)
    : subsections

  const renderMap = (classHeight: string) => {
    if (subsections.length) {
      if (filteredSubsections.length) {
        return (
          <MapProvider>
            <ProjectMap subsections={filteredSubsections} classHeight={classHeight} />
          </MapProvider>
        )
      }
      return <ProjectMapFallback subsections={subsections} classHeight={classHeight} />
    }
    return (
      <MapProvider>
        <ProjectMapFallback subsections={[]} classHeight={classHeight} />
      </MapProvider>
    )
  }

  return (
    <div className={twJoin(isMapMode && MAP_VIEWPORT_SHELL_CLASS)}>
      <PageHeader
        className={isMapMode ? "mb-0 shrink-0" : undefined}
        breadcrumb={<ProjectPageBreadcrumb />}
        info="Übersicht über alle Planungsabschnitte des Projekts."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={<OperatorFilter />}
        action={
          <IfUserCanEdit>
            <Link icon="edit" to="/$projectSlug/edit" params={{ projectSlug }}>
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
        primaryAction={
          <Link button to="/$projectSlug/abschnitte/new" params={{ projectSlug }}>
            Neuer Planungsabschnitt
          </Link>
        }
      />

      <MapListViewLayout
        mode={viewMode}
        map={renderMap}
        list={<SubsectionTable subsections={filteredSubsections} />}
      >
        <SuperAdminBox className="flex flex-col items-start gap-4">
          <Link button to={`/admin/projects/${projectSlug}/subsections/multiple-new`}>
            Mehrere Planungsabschnitte erstellen
          </Link>
          <Link button to={`/admin/projects/${projectSlug}/subsections`}>
            Placemark Import für Planungsabschnitte
          </Link>
        </SuperAdminBox>
        <SuperAdminLogData data={{ project, subsections, filteredSubsections }} />
      </MapListViewLayout>
    </div>
  )
}
