import { useSuspenseQuery } from "@tanstack/react-query"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { AdminProjectsList } from "@/src/components/dashboard/AdminProjectsList"
import { DashboardMapWithProvider } from "@/src/components/dashboard/DashboardMapWithProvider"
import { LogEntriesDashboard } from "@/src/components/dashboard/LogEntriesDashboard"
import { NoProjectMembershipsYet } from "@/src/components/dashboard/NoProjectMembershipsYet"
import { ProjectsTable } from "@/src/components/dashboard/ProjectsTable"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"

export function PageDashboard() {
  const { data: projects } = useSuspenseQuery(projectsWithGeometryWithMembershipRoleQueryOptions())

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
    <>
      <PageHeader
        title="Meine Projekte"
        info="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
      />
      <DashboardMapWithProvider projects={projects} />
      <ProjectsTable projects={projects} />
      <AdminProjectsList />
      <LogEntriesDashboard userProjects={projects} />
      <SuperAdminLogData data={projects} />
    </>
  )
}
