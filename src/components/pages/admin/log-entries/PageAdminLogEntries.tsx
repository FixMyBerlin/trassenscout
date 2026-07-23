import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableDateTime } from "@/src/components/core/components/Table/TableDateTime"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { PaginationControls } from "@/src/components/core/pagination/PaginationControls"
import { usePagination } from "@/src/components/core/pagination/usePagination"
import { systemLogEntriesQueryOptions } from "@/src/server/systemLogEntries/systemLogEntriesQueryOptions"
import { SYSTEM_LOG_ENTRIES_DEFAULT_PAGE_SIZE } from "@/src/shared/systemLogEntries/searchSchemas"
import { logLevelBadgeVariant } from "./logLevelBadgeVariant"

const routeApi = getRouteApi("/admin/logEntries/")

export function PageAdminLogEntries() {
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const { page, pageSize, goToPage } = usePagination(search, navigate, {
    defaultPageSize: SYSTEM_LOG_ENTRIES_DEFAULT_PAGE_SIZE,
  })
  const { data } = useSuspenseQuery(systemLogEntriesQueryOptions({ page, pageSize }))

  return (
    <>
      <AdminPageHeader title="LogEntries" />
      <TableWrapper>
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Datum
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                LogLevel
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Message, Details, User, Project
              </th>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {data.logEntries.map((logEntry) => (
              <tr key={logEntry.id} className={tableRowClassName}>
                <td className="py-4 pr-3 pl-4 text-sm sm:pl-6">
                  <TableDateTime value={logEntry.createdAt} />
                </td>
                <td className="py-4 pr-3 pl-4 text-sm sm:pr-6">
                  <AdminBadge variant={logLevelBadgeVariant[logEntry.logLevel]}>
                    {logEntry.logLevel}
                  </AdminBadge>
                </td>
                <td className="py-4 pr-3 pl-4 text-sm sm:pr-6">
                  <strong>{logEntry.message}</strong>
                  <br />
                  <pre>{JSON.stringify(logEntry.context, undefined, 2)}</pre>
                  <br />
                  UserId: {logEntry.userId || "–"}
                  <br />
                  ProjectId: {logEntry.projectId || "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          page={page}
          result={{ from: data.from, to: data.to, count: data.count, hasMore: data.hasMore }}
          onPageChange={goToPage}
        />
      </TableWrapper>
    </>
  )
}
