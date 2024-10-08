import { invoke } from "@/src/blitz-server"
import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link } from "@/src/core/components/links"
import getLogEntries from "@/src/server/logEntries/queries/getLogEntries"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import "server-only"
import { Breadcrumb } from "../_components/Breadcrumb"
import { HeaderWrapper } from "../_components/HeaderWrapper"

export const metadata = { title: "LogEntries" }

export default async function AdminLogEntriesPage() {
  const { logEntries } = await invoke(getLogEntries, {})

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb
          pages={[
            { href: "/admin", name: "Dashboard" },
            { href: "/admin/logEntries", name: "LogEntries" },
          ]}
        />
      </HeaderWrapper>

      <p>Maximal 250 Einträge.</p>
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">
                Datum
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold sm:pr-6">
                LogLevel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold sm:pr-6">
                Message, Details, User, Project
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {logEntries.map((logEntry) => {
              return (
                <tr key={logEntry.id}>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                    {format(new Date(logEntry.createdAt), "Pp", { locale: de })}
                    {format(new Date(logEntry.createdAt), "Pp") !==
                      format(new Date(logEntry.updatedAt), "Pp") && (
                      <>
                        <br />
                        <strong>
                          {format(new Date(logEntry.updatedAt), "Pp", { locale: de })}
                        </strong>
                      </>
                    )}
                    <br />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(logEntry.createdAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pr-6">
                    <StatusLabel
                      label={logEntry.logLevel}
                      colorClass={
                        {
                          INFO: "text-yellow-700 bg-yellow-100",
                          WARN: "text-pink-700 bg-pink-100",
                          ERROR: "text-red-700 bg-red-100",
                        }[logEntry.logLevel]
                      }
                    >
                      {}
                    </StatusLabel>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm sm:pr-6">
                    <strong>{logEntry.message}</strong>
                    <br />
                    <pre>{JSON.stringify(logEntry.context, undefined, 2)}</pre>
                    <br />
                    UserId: {logEntry.userId || "–"}
                    <br />
                    ProjectId: {logEntry.projectId || "–"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrapper>
      <hr className="my-5" />
      <p>
        <Link href="/dashboard">Startseite</Link>
      </p>
    </>
  )
}
