import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link, linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  useSubsubsectionSpecialMutations,
  useSubsubsectionSpecialRouteLinks,
} from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsectionSpecials: any[]
}

export const SubsubsectionSpecialsTable = ({ subsubsectionSpecials }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useSubsubsectionSpecialRouteLinks(projectSlug)
  const { deleteRow } = useSubsubsectionSpecialMutations(projectSlug, search)

  const handleDelete = async (subsubsectionSpecialId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionSpecialId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(subsubsectionSpecialId)
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
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Kürzel
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Titel
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Anzahl Maßnahmen mit dieser Besonderheit
              </th>
              <th scope="col" className={tableHeadCellRightClassName}>
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {subsubsectionSpecials.map((special) => {
              return (
                <tr key={special.id} className={tableRowClassName}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(special.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{special.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {special.subsubsectionCount}{" "}
                    {special.subsubsectionCount > 1 ? "Maßnahmen" : "Maßnahme "}
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link icon="edit" {...editLink(special.id)}>
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(special.id)}
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
