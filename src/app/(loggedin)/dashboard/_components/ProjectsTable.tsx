"use client"
import { ProjectIcon } from "@/src/core/components/Map/Icons/ProjectIcon"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { longTitle, shortTitle } from "@/src/core/components/text"
import { roleTranslation } from "@/src/pagesComponents/memberships/roleTranslation.const"
import { TGetProjectsWithGeometryWithMembershipRole } from "@/src/server/projects/queries/getProjectsWithGeometryWithMembershipRole"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  projects: TGetProjectsWithGeometryWithMembershipRole
}

export const ProjectsTable = ({ projects }: Props) => {
  const router = useRouter()

  return (
    <TableWrapper className="mt-12">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              colSpan={2}
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
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
          {projects.map((project) => {
            const route = `/${project.slug}` as Route

            return (
              <tr
                key={project.id}
                className="group cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(route)}
              >
                <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <ProjectIcon label={shortTitle(project.slug)} />
                </td>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                  <strong>{longTitle(project.slug)}</strong>
                  <br />
                  {project.subTitle}
                </td>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                  {project.subsections.length}
                </td>
                <td className="break-words py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                  {project.memberships[0] ? roleTranslation[project.memberships[0].role] : ""}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </TableWrapper>
  )
}
