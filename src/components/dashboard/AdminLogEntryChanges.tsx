import { format } from "date-fns/format"
import { de } from "date-fns/locale/de"
import type { Diff } from "datum-diff"
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
    case "updatedAt":
      return format(content, "Pp", { locale: de })

    case "geometry":
      return "(Koordinaten)"

    case undefined:
    default:
      return content
  }
}

export const AdminLogEntryChanges = ({ context }: Props) => {
  if (!Array.isArray(context)) return null

  return (
    <table className="mt-4 min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-1.5 py-1 text-left text-sm font-semibold text-gray-900">
            Änderung
          </th>
          <th scope="col" className="px-1.5 py-1 text-left text-sm font-semibold text-gray-900">
            Wert
          </th>
          <th scope="col" className="px-1.5 py-1 text-left text-sm font-semibold text-gray-900">
            Vorher
          </th>
          <th scope="col" className="px-1.5 py-1 text-left text-sm font-semibold text-gray-900">
            Nachher
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {context.map((entry_) => {
          const entry = entry_ as Diff<unknown, unknown>
          return (
            <tr key={entry.path.join()}>
              <td className="px-1.5 py-1 text-sm text-gray-500">{diffTranslations[entry.kind]}</td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                <code className="text-xs font-semibold">{entry.path.join(" > ")}</code>
              </td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                {"lhs" in entry ? dateOrData(entry.path, String(entry.lhs)) : null}
              </td>
              <td className="px-1.5 py-1 text-sm text-gray-500">
                {"rhs" in entry ? dateOrData(entry.path, String(entry.rhs)) : null}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
