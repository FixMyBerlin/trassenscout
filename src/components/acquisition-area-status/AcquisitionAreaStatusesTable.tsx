import { getRouteApi } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import {
  useAcquisitionAreaStatusMutations,
  useAcquisitionAreaStatusRouteLinks,
} from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
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
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import {
  type AcquisitionAreaStatusStyle,
  acquisitionAreaStatusStyleBadgeClasses,
  acquisitionAreaStatusStyleTranslations,
} from "./acquisitionAreaStatusStyles"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  acquisitionAreaStatuses: any[]
}

export const AcquisitionAreaStatusesTable = ({ acquisitionAreaStatuses }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { search, editLink } = useAcquisitionAreaStatusRouteLinks(projectSlug)
  const { deleteRow } = useAcquisitionAreaStatusMutations(projectSlug, search)

  const handleDelete = async (acquisitionAreaStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${acquisitionAreaStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(acquisitionAreaStatusId)
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
              Anzahl Verhandlungsflächen in diesem Status
            </th>
            <th scope="col" className={tableHeadCellRightClassName}>
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {acquisitionAreaStatuses.map((status) => (
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
                    acquisitionAreaStatusStyleBadgeClasses[
                      status.style as AcquisitionAreaStatusStyle
                    ],
                  )}
                >
                  {
                    acquisitionAreaStatusStyleTranslations[
                      status.style as AcquisitionAreaStatusStyle
                    ]
                  }
                </span>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {status.acquisitionAreaCount}{" "}
                {status.acquisitionAreaCount === 1 ? "Verhandlungsfläche" : "Verhandlungsflächen"}
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
          ))}
        </tbody>
      </table>
      {!acquisitionAreaStatuses.length && (
        <ZeroCase visible name="Flächenerwerb-Status" verb="angelegt" />
      )}
    </TableWrapper>
  )
}
