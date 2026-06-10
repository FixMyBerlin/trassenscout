import { useSuspenseQuery } from "@tanstack/react-query"
import { clsx } from "clsx"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const AdminProjectsList = () => {
  const { data: user } = useSuspenseQuery(currentUserQueryOptions())

  if (user?.role !== UserRoleEnum.ADMIN) return null

  return <AdminProjectsListContent />
}

const AdminProjectsListContent = () => {
  const {
    data: { projects },
  } = useSuspenseQuery(adminProjectsWithCountsQueryOptions())

  return (
    <SuperAdminBox className="mx-auto prose prose-sm">
      <h2 className="mt-0">Alle Projekte</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <div className="flex items-center gap-2">
              <strong>
                <Link to={`/${project.slug}`}>{shortTitle(project.slug)}</Link>
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
        ))}
      </ul>
    </SuperAdminBox>
  )
}
