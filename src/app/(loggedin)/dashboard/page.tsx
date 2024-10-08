import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjects from "@/src/server/projects/queries/getProjects"
import { Metadata } from "next"
import "server-only"
import { NoProjectMembershipsYet } from "./_components/NoProjectMembershipsYet"
import { ProjectTable } from "./_components/ProjectTable"

export const metadata: Metadata = {
  robots: "noindex",
  title: "Meine Projekte (Dashboard)",
}

export default async function DashboardPage() {
  const { projects } = await invoke(getProjects, {})

  if (!projects.length) {
    return <NoProjectMembershipsYet />
  }

  return (
    <>
      <PageHeader
        title="Meine Projekte"
        // subtitle={project.subTitle}
        description="Willkommen im Trassenscout. Hier finden Sie alle Projekte, an denen Sie beteiligt sind."
        className="mt-10" // Usually added by the Breadcrumb component
      />
      <ProjectTable projects={projects} />
      <SuperAdminLogData data={projects} />
    </>
  )
}
