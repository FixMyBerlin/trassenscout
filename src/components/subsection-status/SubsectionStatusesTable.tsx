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
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  useSubsectionStatusMutations,
  useSubsectionStatusRouteLinks,
} from "@/src/components/subsection-status/useSubsectionStatusActions"

type Props = {
  subsectionStatuss: any[]
  projectSlug: string
}

export const SubsectionStatusesTable = ({ subsectionStatuss, projectSlug }: Props) => {
  const { search, editLink } = useSubsectionStatusRouteLinks(projectSlug)
  const { deleteRow } = useSubsectionStatusMutations(projectSlug, search)

  const handleDelete = async (subsectionStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsectionStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(subsectionStatusId)
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
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
              Darstellung
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Anzahl Planungsabschnitte mit diesem Status
            </th>
            <th scope="col" className={tableHeadCellRightClassName}>
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {subsectionStatuss.map((status) => {
            return (
              <tr key={status.id} className={tableRowClassName}>
                <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <strong className="font-semibold">{shortTitle(status.slug)}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <strong className="font-semibold">{status.title}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <span
                    className={twJoin(
                      pillShellClasses,
                      "text-xs",
                      status.style === "REGULAR"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800",
                    )}
                  >
                    {status.style === "REGULAR" ? "Durchgezogen" : "Gestrichelt"}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {status.subsectionCount}{" "}
                  {status.subsectionCount > 1 ? "Planungsabschnitte" : "Planungsabschnitt"}
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
  )
}
