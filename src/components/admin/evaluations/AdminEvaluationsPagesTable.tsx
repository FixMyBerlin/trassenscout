import { Link } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import {
  adminTableBodyClassName,
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
  adminTableHeadRowClassName,
  adminTableRowClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableActions, AdminTableEditLink } from "@/src/components/admin/AdminTableActions"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { formatTableDateTime } from "@/src/components/core/utils/formatTableDateTime"
import type { EvaluationsPagesList } from "@/src/server/evaluationsPage/types"

type Props = {
  pages: EvaluationsPagesList
}

function formatUpdatedAt(value: Date | string | null) {
  if (!value) return "—"
  const formatted = formatTableDateTime(value)
  if (!formatted) return "—"
  return `${formatted.date} ${formatted.time}`
}

export const AdminEvaluationsPagesTable = ({ pages }: Props) => {
  if (!pages.length) {
    return <p className="px-4 text-sm text-gray-600">Noch keine Projekte vorhanden.</p>
  }

  return (
    <TableWrapper withTopBorder className="mt-7">
      <table className={adminTableClassName}>
        <thead>
          <tr className={adminTableHeadRowClassName}>
            <th className={adminTableHeaderClassName}>Projekt</th>
            <th className={adminTableHeaderClassName}>Auswertungen</th>
            <th className={adminTableHeaderClassName}>Titel</th>
            <th className={adminTableHeaderClassName}>Aktualisiert</th>
            <th className={adminTableHeaderRightClassName}>Aktion</th>
          </tr>
        </thead>
        <tbody className={adminTableBodyClassName}>
          {pages.map((page) => (
            <tr key={page.projectSlug} className={adminTableRowClassName}>
              <td className={adminTableCellClassName}>
                {page.evaluationsEnabled ? (
                  <Link
                    to="/$projectSlug/evaluations"
                    params={{ projectSlug: page.projectSlug }}
                    className="text-blue-600 hover:underline"
                  >
                    {page.projectSlug}
                  </Link>
                ) : (
                  page.projectSlug
                )}
              </td>
              <td className={adminTableCellClassName}>
                <AdminBadge variant={page.evaluationsEnabled ? "green" : "gray"}>
                  {page.evaluationsEnabled ? "aktiv" : "inaktiv"}
                </AdminBadge>
              </td>
              <td className={adminTableCellClassName}>{page.title ?? "—"}</td>
              <td className={adminTableCellClassName}>{formatUpdatedAt(page.updatedAt)}</td>
              <td className={adminTableCellRightClassName}>
                <AdminTableActions>
                  <AdminTableEditLink to={`/admin/evaluations/${page.projectSlug}/edit`} />
                </AdminTableActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
