import { useSuspenseQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { twJoin } from "tailwind-merge"
import { AdminBoxSection } from "@/src/components/core/components/AdminBox/AdminBoxSection"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { longTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import type { LogLevelActionEnum } from "@/src/prisma/generated/browser"
import { projectLogEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { AdminLogEntryChanges } from "./AdminLogEntryChanges"

type Props = {
  projectId: number
  projectSlug: string
}

const actionName: Record<LogLevelActionEnum, string> = {
  CREATE: "Erstellt",
  UPDATE: "Aktualisiert",
  DELETE: "Gelöscht",
}

const actionColorClasses: Record<LogLevelActionEnum, string> = {
  CREATE: "bg-teal-50  text-teal-800  ring-teal-600/20",
  UPDATE: "bg-purple-50  text-purple-800  ring-purple-600/20",
  DELETE: "bg-amber-50  text-amber-800  ring-amber-600/20",
}

export const ProjectLogEntries = ({ projectId, projectSlug }: Props) => {
  const {
    data: { logEntries },
  } = useSuspenseQuery(projectLogEntriesQueryOptions({ projectSlug, projectId }))

  return (
    <AdminBoxSection
      title={<>Änderungen in {frenchQuote(longTitle(projectSlug))}</>}
      actions={<SuperAdminLogData data={logEntries} />}
    >
      <TableWrapper>
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Date
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Aktion
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Details
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Benutzer
              </th>
            </tr>
          </thead>

          <tbody className={tableBodyClassName}>
            {logEntries.map((entry) => (
              <tr key={entry.id} className={tableRowClassName}>
                <td className="py-4 pr-3 pl-4 align-top text-sm leading-tight sm:pl-6">
                  {format(entry.createdAt, "Pp", { locale: de })}
                  <br />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(entry.createdAt, { addSuffix: true, locale: de })}
                  </span>
                </td>
                <td className="px-3 py-4 align-top text-sm text-gray-500">
                  <span
                    className={twJoin(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      actionColorClasses[entry.action],
                    )}
                  >
                    {actionName[entry.action]}
                  </span>
                </td>
                <td className="px-3 py-4 align-top text-sm text-gray-500">
                  {entry.changes ? (
                    <details>
                      <summary className="cursor-pointer underline-offset-2 hover:underline">
                        {entry.message}
                      </summary>
                      <AdminLogEntryChanges context={entry.changes} />
                    </details>
                  ) : (
                    entry.message
                  )}
                </td>
                <td className="py-4 pr-4 pl-3 align-top text-sm sm:pr-6">
                  {entry.user ? getFullname(entry.user) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    </AdminBoxSection>
  )
}
