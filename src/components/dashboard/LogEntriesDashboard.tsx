import { useSuspenseQuery } from "@tanstack/react-query"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import { GeneralLogEntries } from "./GeneralLogEntries"
import { ProjectLogEntries } from "./ProjectLogEntries"

type Props = { userProjects: ProjectsWithGeometryWithMembershipRole }

export const LogEntriesDashboard = ({ userProjects }: Props) => {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (user?.role === UserRoleEnum.ADMIN) {
    return <AdminLogEntriesDashboard />
  }

  const relevantProjects = userProjects.filter(
    (project) => project.showLogEntries && project.memberships[0]?.role === "EDITOR",
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

const AdminLogEntriesDashboard = () => {
  const {
    data: { projects },
  } = useSuspenseQuery(adminProjectsWithCountsQueryOptions())

  return (
    <SuperAdminBox>
      <GeneralLogEntries />
      {projects.map((project) => (
        <ProjectLogEntries key={project.id} projectId={project.id} projectSlug={project.slug} />
      ))}
    </SuperAdminBox>
  )
}
