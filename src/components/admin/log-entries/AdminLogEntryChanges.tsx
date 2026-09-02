import type { Diff } from "datum-diff"
import { twJoin } from "tailwind-merge"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import type { Prisma } from "@/src/prisma/generated/browser"

type Props = { context: Prisma.JsonValue }

const diffTranslations = {
  N: "Hinzugefügt",
  D: "Gelöscht",
  E: "Geändert",
  A: "Verändert",
}

const dateOrData = (path: string[], content: string) => {
  switch (path.at(0)) {
    case "geometry":
      return "(Koordinaten)"

    case undefined:
    default:
      return content
  }
}

const formatDiffValue = (path: string[], value: unknown) => {
  if (value == null) return null
  if (typeof value === "object") {
    return dateOrData(path, JSON.stringify(value))
  }
  return dateOrData(path, String(value))
}

export const AdminLogEntryChanges = ({ context }: Props) => {
  if (context != null && typeof context === "object" && !Array.isArray(context)) {
    const entries = Object.entries(context)
    if (entries.length === 0) return null

    return (
      <table className={twJoin("mt-4", tableClassName)}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th scope="col" className={tableHeadCellClassName}>
              Feld
            </th>
            <th scope="col" className={tableHeadCellClassName}>
              Wert
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {entries.map(([key, value]) => (
            <tr key={key} className={tableRowClassName}>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                <code className="text-xs font-semibold">{key}</code>
              </td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                {dateOrData([key], typeof value === "string" ? value : JSON.stringify(value))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (!Array.isArray(context)) return null

  return (
    <table className={twJoin("mt-4", tableClassName)}>
      <thead>
        <tr className={tableHeadRowClassName}>
          <th scope="col" className={tableHeadCellClassName}>
            Änderung
          </th>
          <th scope="col" className={tableHeadCellClassName}>
            Wert
          </th>
          <th scope="col" className={tableHeadCellClassName}>
            Vorher
          </th>
          <th scope="col" className={tableHeadCellClassName}>
            Nachher
          </th>
        </tr>
      </thead>
      <tbody className={tableBodyClassName}>
        {context.map((entry_) => {
          const entry = entry_ as Diff<unknown, unknown>
          return (
            <tr key={entry.path.join()} className={tableRowClassName}>
              <td className="px-1.5 py-1 text-sm text-gray-500">{diffTranslations[entry.kind]}</td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                <code className="text-xs font-semibold">{entry.path.join(" > ")}</code>
              </td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                {"lhs" in entry ? formatDiffValue(entry.path, entry.lhs) : null}
              </td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                {"rhs" in entry ? formatDiffValue(entry.path, entry.rhs) : null}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
