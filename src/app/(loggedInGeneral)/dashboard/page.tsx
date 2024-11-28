import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectsWithGeometryWithMembershipRole from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { Metadata } from "next"
import "server-only"
import { AdminProjectsList } from "./_components/AdminProjectsList"
import { NoProjectMembershipsYet } from "./_components/NoProjectMembershipsYet"
import { ProjectsMap } from "./_components/ProjectsMap"
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
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Meine Projekte"
        // subtitle={project.subTitle}
        description="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
        className="mt-10" // Usually added by the Breadcrumb component
      />
      <ProjectsMap projects={projects} />
      <ProjectsTable projects={projects} />
      <AdminProjectsList />
      <SuperAdminLogData data={projects} />
    </>
  )
}
