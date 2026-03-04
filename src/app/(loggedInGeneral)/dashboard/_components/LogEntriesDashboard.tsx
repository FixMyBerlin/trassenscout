import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox/SuperAdminBox"
import getProjects from "@/src/server/projects/queries/getProjects"
import type { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import getCurrentUser from "@/src/server/users/queries/getCurrentUser"
import "server-only"
import { GeneralLogEntries } from "./GeneralLogEntries"
import { ProjectLogEntries } from "./ProjectLogEntries"

type Props = { userProjects: TGetProjectsWithGeometryWithMembershipRole }

export const LogEntriesDashboard = async ({ userProjects }: Props) => {
  const user = await invoke(getCurrentUser, null)

  if (user?.role === "ADMIN") {
    const { projects } = await invoke(getProjects, {})
    return (
      <SuperAdminBox className="space-y-6">
        <GeneralLogEntries />
        {projects.map((project) => (
          <ProjectLogEntries key={project.id} projectId={project.id} projectSlug={project.slug} />
        ))}
      </SuperAdminBox>
    )
  }

  // We only allow log entries for projects where the flag is on `showLogEntries`
  // AND user has `role=EDITOR`.
  const relevantProjects = userProjects.filter(
    (p) => p.showLogEntries && p.memberships[0]?.role === "EDITOR",
  )
  if (!relevantProjects.length) return null

  return (
    <section className="mt-10 space-y-6">
      {relevantProjects.map((project) => (
        <ProjectLogEntries key={project.id} projectId={project.id} projectSlug={project.slug} />
      ))}
    </section>
  )
}
