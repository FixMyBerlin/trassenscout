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
import { PaginationControls } from "@/src/components/core/pagination/PaginationControls"
import { usePagination } from "@/src/components/core/pagination/usePagination"
import {
  useOperatorMutations,
  useOperatorRouteLinks,
} from "@/src/components/operators/useOperatorActions"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { OPERATORS_DEFAULT_PAGE_SIZE } from "@/src/shared/operators/searchSchemas"
import type { PaginationResult } from "@/src/shared/pagination/types"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const operatorsRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/")

type Props = {
  operators: any[]
  pagination: Pick<PaginationResult, "from" | "to" | "count" | "hasMore">
}

export const OperatorsTable = ({ operators, pagination }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const operatorsSearch = operatorsRouteApi.useSearch()
  const operatorsNavigate = operatorsRouteApi.useNavigate()
  const { page, goToPage } = usePagination(operatorsSearch, operatorsNavigate, {
    defaultPageSize: OPERATORS_DEFAULT_PAGE_SIZE,
  })
  const { search, editLink } = useOperatorRouteLinks(projectSlug)
  const { deleteRow } = useOperatorMutations(projectSlug, search)

  const handleDelete = async (operatorId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${operatorId} unwiderruflich löschen?`)) {
      try {
        await deleteRow(operatorId)
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
              Anzahl Planungsabschnitt
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Reihenfolge (Sortierung Liste und Karte)
            </th>
            <th scope="col" className={tableHeadCellRightClassName}>
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {operators.map((operator) => {
            return (
              <tr key={operator.id} className={tableRowClassName}>
                <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <strong className="font-semibold">{shortTitle(operator.slug)}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <strong className="font-semibold">{operator.title}</strong>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {operator.subsectionCount} Planungsabschnitte
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {operator.order}
                </td>
                <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                  <IfUserCanEdit>
                    <ButtonWrapper className="justify-end">
                      <Link icon="edit" {...editLink(operator.id)}>
                        Bearbeiten
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(operator.id)}
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
      <PaginationControls page={page} result={pagination} onPageChange={goToPage} />
    </TableWrapper>
  )
}
