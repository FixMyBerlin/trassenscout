import { useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ProjectIcon } from "@/src/components/core/components/Map/Icons/ProjectIcon"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import type { ProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/types"

type Props = {
  projects: ProjectsWithGeometryWithMembershipRole
}

export const ProjectsTable = ({ projects }: Props) => {
  const navigate = useNavigate()

  return (
    <TableWrapper>
      <table className={tableClassName}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th scope="col" colSpan={2} className={tableHeadCellClassName}>
              Projekt
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Anzahl Planungsabschnitte
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Meine Rolle
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {projects.map((project) => (
            <tr
              key={project.id}
              className={twJoin(tableRowClassName, "group cursor-pointer hover:bg-gray-50")}
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
                {project.subsectionCount}
              </td>
              <td className="py-4 pr-4 pl-3 text-sm font-medium wrap-break-word sm:pr-6">
                {project.memberships[0] ? roleTranslation[project.memberships[0].role] : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!projects.length && <ZeroCase visible name="Projekte" verb="zugeordnet" />}
    </TableWrapper>
  )
}
