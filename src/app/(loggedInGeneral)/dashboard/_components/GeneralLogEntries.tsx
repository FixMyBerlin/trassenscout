import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { invoke } from "@/src/blitz-server"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import getGeneralLogEntries from "@/src/server/logEntries/queries/getGeneralLogEntries"
import { clsx } from "clsx"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import "server-only"

const actionName = {
  CREATE: "Erstellt",
  UPDATE: "Aktualisiert",
  DELETE: "Gelöscht",
} as const

const actionColorClasses = {
  CREATE: "bg-teal-50  text-teal-800  ring-teal-600/20",
  UPDATE: "bg-purple-50  text-purple-800  ring-purple-600/20",
  DELETE: "bg-amber-50  text-amber-800  ring-amber-600/20",
} as const

export const GeneralLogEntries = async () => {
  const { logEntries } = await invoke(getGeneralLogEntries, null)

  if (!logEntries.length) return null

  return (
    <>
      <h2 className="mb-2 text-sm font-semibold">Allgemeine Änderungen (projektunabhängig)</h2>

      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Date
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Aktion
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Details
              </th>
              <th
                scope="col"
                className="py-3.5 pr-4 pl-3 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Benutzer
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {logEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="py-4 pr-3 pl-4 align-top text-sm leading-tight sm:pl-6">
                  {format(entry.createdAt, "Pp", { locale: de })}
                  <br />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(entry.createdAt, { addSuffix: true, locale: de })}
                  </span>
                </td>
                <td className="px-3 py-4 align-top text-sm text-gray-500">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      actionColorClasses[entry.action],
                    )}
                  >
                    {actionName[entry.action]}
                  </span>
                </td>
                <td className="px-3 py-4 align-top text-sm text-gray-500">{entry.message}</td>
                <td className="py-4 pr-4 pl-3 align-top text-sm sm:pr-6">
                  {entry.user ? getFullname(entry.user) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
      <SuperAdminLogData data={logEntries} />
    </>
  )
}
