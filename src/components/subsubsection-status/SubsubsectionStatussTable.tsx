import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  useSubsubsectionStatusMutations,
  useSubsubsectionStatusRouteLinks,
} from "@/src/components/subsubsection-status/useSubsubsectionStatusActions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsectionStatuss: any[]
}

export const SubsubsectionStatussTable = ({ subsubsectionStatuss }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useSubsubsectionStatusRouteLinks(projectSlug)
  const { deleteRow } = useSubsubsectionStatusMutations(projectSlug, search)

  const handleDelete = async (subsubsectionStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(subsubsectionStatusId)
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <>
      <TableWrapper>
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
                Darstellung
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Maßnahmen in dieser Phase
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
            {subsubsectionStatuss.map((status) => {
              return (
                <tr key={status.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(status.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{status.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <span
                      className={twJoin(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        status.style === "REGULAR"
                          ? "bg-sky-400/20 text-sky-600"
                          : "bg-[#4BC556]/20 text-[#4BC556]",
                      )}
                    >
                      {status.style === "REGULAR" ? "Standard" : "Grün"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {status.subsubsectionCount}{" "}
                    {status.subsubsectionCount > 1 ? "Maßnahmen" : "Maßnahme "}
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link icon="edit" {...editLink(status.id)}>
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(status.id)}
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
    </>
  )
}
