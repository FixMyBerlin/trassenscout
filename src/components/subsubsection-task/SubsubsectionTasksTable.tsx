import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  useSubsubsectionTaskMutations,
  useSubsubsectionTaskRouteLinks,
} from "@/src/components/subsubsection-task/useSubsubsectionTaskActions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsectionTasks: any[]
}

export const SubsubsectionTasksTable = ({ subsubsectionTasks }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useSubsubsectionTaskRouteLinks(projectSlug)
  const { deleteRow } = useSubsubsectionTaskMutations(projectSlug, search)

  const handleDelete = async (subsubsectionTaskId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionTaskId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(subsubsectionTaskId)
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <>
      <TableWrapper flushTop>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Kürzel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Titel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Maßnahmen mit <br />
                diesem Maßnahmentyp
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-right text-sm font-semibold text-gray-900 sm:pr-6"
              >
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsectionTasks.map((Task) => {
              return (
                <tr key={Task.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(Task.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{Task.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {Task.subsubsectionCount}{" "}
                    {Task.subsubsectionCount > 1 ? "Maßnahmen" : "Maßnahme "}
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link icon="edit" {...editLink(Task.id)}>
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(Task.id)}
                          className={twJoin(
                            linkStyles,
                            "inline-flex items-center justify-center gap-1",
                          )}
                        >
                          {linkIcons["delete"]}
                          Löschen
                        </button>
                      </ButtonWrapper>
                    </IfUserCanEdit>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrapper>
      <SuperAdminLogData data={{ subsubsectionTasks }} />
    </>
  )
}
