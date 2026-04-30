import db from "@/db"
import { invoke } from "@/src/blitz-server"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Link } from "@/src/core/components/links/Link"
import { shortTitle } from "@/src/core/components/text"
import { pillShellClasses } from "@/src/core/utils/pillClassNames"

import getProjects from "@/src/server/projects/queries/getProjects"
import getCurrentUser from "@/src/server/users/queries/getCurrentUser"
import { clsx } from "clsx"
import "server-only"

export const AdminProjectsList = async () => {
  const user = await invoke(getCurrentUser, null)
  if (user?.role !== "ADMIN") return null

  const projects = await invoke(getProjects, {})

  // Fetch counts for all projects in parallel
  const projectsWithCounts = await Promise.all(
    projects?.projects
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map(async (project) => {
        const [subsectionCount, subsubsectionCount] = await Promise.all([
          db.subsection.count({ where: { projectId: project.id } }),
          db.subsubsection.count({
            where: { subsection: { projectId: project.id } },
          }),
        ])
        return {
          ...project,
          subsectionCount,
          subsubsectionCount,
        }
      }) || [],
  )

  return (
    <SuperAdminBox className="prose mx-auto">
      <h2 className="mt-0">Alle Projekte</h2>
      <ul>
        {projectsWithCounts.map((project) => {
          return (
            <li key={project.id}>
              <div className="flex items-center gap-2">
                <strong>
                  <Link href={`/${project.slug}`}>{shortTitle(project.slug)}</Link>
                </strong>
                <span className="inline-flex items-center gap-2">
                  <span
                    className={clsx(
                      pillShellClasses,
                      "border border-gray-200 bg-gray-50",
                      project.subsectionCount === 0 ? "text-gray-700/60" : "text-gray-700",
                    )}
                  >
                    {project.subsectionCount} Abschnitte
                  </span>
                  <span
                    className={clsx(
                      pillShellClasses,
                      "border border-gray-200 bg-gray-50",
                      project.subsubsectionCount === 0 ? "text-gray-700/60" : "text-gray-700",
                    )}
                  >
                    {project.subsubsectionCount} Teilabschnitte
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </SuperAdminBox>
  )
}
