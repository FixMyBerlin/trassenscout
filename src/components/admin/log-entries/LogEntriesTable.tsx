import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { Fragment, useState } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import type { LogEntryRow } from "@/src/server/logEntries/types"
import {
  logEntryActionColorClasses,
  logEntryActionLabel,
} from "@/src/shared/logEntries/logEntryAction"
import { AdminLogEntryChanges } from "./AdminLogEntryChanges"

type Props = {
  entries: LogEntryRow[]
  isAdmin: boolean
  showProject?: boolean
  emptyText?: string
}

function storedChanges(changes: LogEntryRow["changes"]) {
  if (changes == null) return null
  if (Array.isArray(changes)) return changes.length ? changes : null
  if (typeof changes === "object") return Object.keys(changes).length ? changes : null
  return null
}

export const LogEntriesTable = ({
  entries,
  isAdmin,
  showProject = false,
  emptyText = "Noch keine Einträge.",
}: Props) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([])

  if (!entries.length) return <p className="px-4 text-sm text-gray-500">{emptyText}</p>

  const toggle = (id: number) =>
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )

  const columnCount = 3 + (showProject ? 1 : 0) + (isAdmin ? 2 : 0)

  return (
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
            {showProject ? (
              <th scope="col" className={tableHeadCellClassName}>
                Projekt
              </th>
            ) : null}
            {isAdmin ? (
              <>
                <th scope="col" className={tableHeadCellClassName}>
                  Name
                </th>
                <th scope="col" className={tableHeadCellClassName}>
                  <span className="sr-only">Objektdaten</span>
                </th>
              </>
            ) : null}
          </tr>
        </thead>

        <tbody className={tableBodyClassName}>
          {entries.map((entry) => {
            const changes = storedChanges(entry.changes)
            const isExpanded = expandedIds.includes(entry.id)

            return (
              <Fragment key={entry.id}>
                <tr className={tableRowClassName}>
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
                  {showProject ? (
                    <td className="px-3 py-4 align-top text-sm">
                      {entry.projectSlug ? (
                        <Link to="/$projectSlug" params={{ projectSlug: entry.projectSlug }}>
                          {entry.projectSlug}
                        </Link>
                      ) : (
                        <span className="text-gray-500">–</span>
                      )}
                    </td>
                  ) : null}
                  {isAdmin ? (
                    <>
                      <td className="px-3 py-4 align-top text-sm">
                        {entry.user ? getFullnameWithInstitution(entry.user) : null}
                      </td>
                      <td className="py-4 pr-4 pl-3 align-top text-sm sm:pr-6">
                        {changes ? (
                          <button
                            type="button"
                            onClick={() => toggle(entry.id)}
                            className="cursor-pointer text-gray-400 hover:text-gray-600"
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded ? "Objektdaten schließen" : "Objektdaten anzeigen"
                            }
                          >
                            <ChevronDownIcon
                              className={twJoin(
                                "size-5 transition-transform",
                                isExpanded && "rotate-180",
                              )}
                              aria-hidden
                            />
                          </button>
                        ) : null}
                      </td>
                    </>
                  ) : null}
                </tr>
                {isAdmin && changes && isExpanded ? (
                  <tr>
                    <td colSpan={columnCount} className="bg-gray-50 px-4 pb-4 sm:px-6">
                      <AdminLogEntryChanges context={changes} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </TableWrapper>
  )
}
