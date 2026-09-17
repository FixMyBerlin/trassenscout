import { useSuspenseQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { twJoin } from "tailwind-merge"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { generalLogEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import {
  logEntryActionColorClasses,
  logEntryActionLabel,
} from "@/src/shared/logEntries/logEntryAction"

type Props = {
  /** When true (default), hide the section if there are no entries. */
  hideWhenEmpty?: boolean
}

export const GeneralLogEntries = ({ hideWhenEmpty = true }: Props) => {
  const {
    data: { logEntries },
  } = useSuspenseQuery(generalLogEntriesQueryOptions())

  if (hideWhenEmpty && !logEntries.length) return null

  return (
    <section aria-labelledby="general-log-entries-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-4">
        <h2 id="general-log-entries-heading" className="text-lg font-semibold text-gray-700">
          Allgemeine Änderungen (projektunabhängig)
        </h2>
        <SuperAdminLogData data={logEntries} />
      </div>
      {logEntries.length ? (
        <TableWrapper withTopBorder>
          <table className={tableClassName}>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th scope="col" className={tableHeadCellClassName}>
                  Datum
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Aktion
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Details
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  Name
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
                        logEntryActionColorClasses[entry.action],
                      )}
                    >
                      {logEntryActionLabel[entry.action]}
                    </span>
                  </td>
                  <td className="px-3 py-4 align-top text-sm text-gray-500">{entry.message}</td>
                  <td className="py-4 pr-4 pl-3 align-top text-sm sm:pr-6">
                    {entry.user ? getFullnameWithInstitution(entry.user) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      ) : (
        <p className="px-4 text-sm text-gray-500">Noch keine Einträge.</p>
      )}
    </section>
  )
}
