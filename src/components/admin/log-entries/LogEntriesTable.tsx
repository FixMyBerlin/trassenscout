import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import { format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { Fragment, useState } from "react"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import {
  tableBodyClassName,
  tableCellClassName,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
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
  withTopBorder?: boolean
}

/** Column widths for `table-fixed`; the message column takes what is left. */
const logEntriesTableColWidths = {
  date: "w-[26%] @xl:w-[13%]",
  action: "w-[22%] @xl:w-[10%]",
  message: "w-[52%] @xl:w-auto",
  project: "hidden @xl:table-column @xl:w-[14%]",
  user: "hidden @xl:table-column @xl:w-[16%]",
  expand: "w-[8%] @xl:w-[4%]",
} as const

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
  withTopBorder = false,
}: Props) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([])

  if (!entries.length) return <p className="px-4 text-sm text-gray-500">{emptyText}</p>

  const toggle = (id: number) =>
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id],
    )

  const columnCount = 3 + (showProject ? 1 : 0) + (isAdmin ? 2 : 0)

  return (
    <TableWrapper withTopBorder={withTopBorder}>
      <div className="@container w-full">
        <table className={tableFixedClassName}>
          <colgroup>
            <col className={logEntriesTableColWidths.date} />
            <col className={logEntriesTableColWidths.action} />
            <col className={logEntriesTableColWidths.message} />
            {showProject ? <col className={logEntriesTableColWidths.project} /> : null}
            {isAdmin ? <col className={logEntriesTableColWidths.user} /> : null}
            {isAdmin ? <col className={logEntriesTableColWidths.expand} /> : null}
          </colgroup>
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
                <th scope="col" className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}>
                  Projekt
                </th>
              ) : null}
              {isAdmin ? (
                <>
                  <th
                    scope="col"
                    className={twJoin(tableHeadCellClassName, "hidden @xl:table-cell")}
                  >
                    Name
                  </th>
                  <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                    Objektdaten
                  </th>
                </>
              ) : null}
            </tr>
          </thead>

          <tbody className={tableBodyClassName}>
            {entries.map((entry) => {
              const changes = storedChanges(entry.changes)
              const canExpand = isAdmin && Boolean(changes)
              const isExpanded = expandedIds.includes(entry.id)

              return (
                <Fragment key={entry.id}>
                  {/* The whole row toggles, the way a response opens on the Eingaben list. */}
                  <tr
                    className={twJoin(
                      tableRowClassName,
                      canExpand && "group cursor-pointer hover:bg-gray-50",
                      isExpanded && "bg-gray-50",
                    )}
                    onClick={canExpand ? () => toggle(entry.id) : undefined}
                  >
                    <td className={twJoin(tableCellClassName, "align-top leading-tight")}>
                      {format(entry.createdAt, "Pp", { locale: de })}
                      <br />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(entry.createdAt, { addSuffix: true, locale: de })}
                      </span>
                    </td>
                    <td className={twJoin(tableCellClassName, "align-top")}>
                      <span
                        className={twJoin(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                          logEntryActionColorClasses[entry.action],
                        )}
                      >
                        {logEntryActionLabel[entry.action]}
                      </span>
                    </td>
                    <td className={twJoin(tableCellClassName, "align-top wrap-break-word")}>
                      {entry.message}
                    </td>
                    {showProject ? (
                      <td className={twJoin(tableCellClassName, "hidden align-top @xl:table-cell")}>
                        {entry.projectSlug ? (
                          <Link
                            to="/$projectSlug"
                            params={{ projectSlug: entry.projectSlug }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {shortTitle(entry.projectSlug)}
                          </Link>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>
                    ) : null}
                    {isAdmin ? (
                      <>
                        <td
                          className={twJoin(
                            tableCellClassName,
                            "hidden align-top wrap-break-word @xl:table-cell",
                          )}
                        >
                          {entry.user ? getFullnameWithInstitution(entry.user) : null}
                        </td>
                        <td className={twJoin(tableCellClassName, "align-top")}>
                          {canExpand ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                toggle(entry.id)
                              }}
                              className="flex w-full cursor-pointer items-center justify-end"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded ? "Objektdaten schließen" : "Objektdaten anzeigen"
                              }
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="size-5 shrink-0 text-gray-700 group-hover:text-black" />
                              ) : (
                                <ChevronDownIcon className="size-5 shrink-0 text-gray-700 group-hover:text-black" />
                              )}
                            </button>
                          ) : null}
                        </td>
                      </>
                    ) : null}
                  </tr>
                  {canExpand && isExpanded ? (
                    <tr className="bg-gray-50">
                      <td colSpan={columnCount} className="px-3 pb-3">
                        <AdminLogEntryChanges context={changes} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </TableWrapper>
  )
}
