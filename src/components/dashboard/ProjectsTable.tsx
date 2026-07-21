import { useNavigate } from "@tanstack/react-router"
import { ProjectIcon } from "@/src/components/core/components/Map/Icons/ProjectIcon"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
}

export const ProjectsTable = ({ projects }: Props) => {
  const navigate = useNavigate()

  return (
    <TableWrapper flushTop>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              colSpan={2}
              className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Projekt
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Anzahl Planungsabschnitte
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
            >
              Meine Rolle
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="group cursor-pointer hover:bg-gray-50"
              onClick={() =>
                navigate({ to: "/$projectSlug", params: { projectSlug: project.slug } })
              }
            >
              <td className="h-20 w-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                <ProjectIcon label={shortTitle(project.slug)} />
              </td>
              <td className="py-4 pr-3 pl-4 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                {project.subTitle}
              </td>
              <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                {project.subsections.length}
              </td>
              <td className="py-4 pr-4 pl-3 text-sm font-medium wrap-break-word sm:pr-6">
                {project.memberships[0] ? roleTranslation[project.memberships[0].role] : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
