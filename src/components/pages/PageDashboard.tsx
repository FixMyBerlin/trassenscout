import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import {
  MapListViewLayout,
  MAP_VIEWPORT_SHELL_CLASS,
} from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { AdminProjectsList } from "@/src/components/dashboard/AdminProjectsList"
import { DashboardMapWithProvider } from "@/src/components/dashboard/DashboardMapWithProvider"
import { LogEntriesDashboard } from "@/src/components/dashboard/LogEntriesDashboard"
import { NoProjectMembershipsYet } from "@/src/components/dashboard/NoProjectMembershipsYet"
import { ProjectsTable } from "@/src/components/dashboard/ProjectsTable"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export function PageDashboard() {
  const { data: projects } = useSuspenseQuery(projectsWithGeometryWithMembershipRoleQueryOptions())
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const isMapMode = viewMode === "map"

  if (!projects.length) {
    return (
      <>
        <NoProjectMembershipsYet />
        <AdminProjectsList />
        <LogEntriesDashboard userProjects={[]} />
      </>
    )
  }

  return (
    <div className={twJoin(isMapMode && `-mb-16 ${MAP_VIEWPORT_SHELL_CLASS}`)}>
      <PageHeader
        className={isMapMode ? "mb-0 shrink-0" : undefined}
        info="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <MapListViewLayout
        mode={viewMode}
        map={(classHeight) => (
          <DashboardMapWithProvider projects={projects} classHeight={classHeight} />
        )}
        list={<ProjectsTable projects={projects} />}
      >
        <AdminProjectsList />
        <LogEntriesDashboard userProjects={projects} />
        <SuperAdminLogData data={projects} />
      </MapListViewLayout>
    </div>
  )
}
