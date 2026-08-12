import { ProjectLogEntries } from "@/src/components/admin/log-entries/ProjectLogEntries"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Props = { userProjects: ProjectsWithGeometryWithMembershipRole }

/** Editors with `showLogEntries` see project audit logs on the dashboard. Admins use `/admin/log-entries`. */
export const LogEntriesDashboard = ({ userProjects }: Props) => {
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
