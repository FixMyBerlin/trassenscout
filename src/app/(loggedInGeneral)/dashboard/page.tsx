import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectsWithGeometryWithMembershipRole from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { Metadata } from "next"
import "server-only"
import { AdminProjectsList } from "./_components/AdminProjectsList"
import { DashboardMapWithProvider } from "./_components/DashboardMapWithProvider"
import { LogEntriesDashboard } from "./_components/LogEntriesDashboard"
import { NoProjectMembershipsYet } from "./_components/NoProjectMembershipsYet"
import { ProjectsTable } from "./_components/ProjectsTable"

export const metadata: Metadata = {
  title: "Meine Projekte (Dashboard)",
}

export default async function DashboardPage() {
  const projects = await invoke(getProjectsWithGeometryWithMembershipRole, {})

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
        // subtitle={project.subTitle}
        description="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
        className="mt-12" // Usually added by the Breadcrumb component
      />
      <DashboardMapWithProvider projects={projects} />
      <ProjectsTable projects={projects} />
      <AdminProjectsList />
      <LogEntriesDashboard userProjects={projects} />
      <SuperAdminLogData data={projects} />
    </>
  )
}
