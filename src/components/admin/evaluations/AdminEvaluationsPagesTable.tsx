import { Link } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import {
  adminTableCellClassName,
  adminTableCellRightClassName,
  adminTableClassName,
  adminTableHeaderClassName,
  adminTableHeaderRightClassName,
  adminTableWrapperClassName,
} from "@/src/components/admin/adminListClasses"
import { AdminTableActions, AdminTableEditLink } from "@/src/components/admin/AdminTableActions"
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
    return <p className="text-sm text-gray-600">Noch keine Projekte vorhanden.</p>
  }

  return (
    <div className={adminTableWrapperClassName}>
      <table className={adminTableClassName}>
        <thead className="bg-gray-50">
          <tr>
            <th className={adminTableHeaderClassName}>Projekt</th>
            <th className={adminTableHeaderClassName}>Auswertungen</th>
            <th className={adminTableHeaderClassName}>Titel</th>
            <th className={adminTableHeaderClassName}>Aktualisiert</th>
            <th className={adminTableHeaderRightClassName}>Aktion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pages.map((page) => (
            <tr key={page.projectSlug}>
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
    </div>
  )
}
