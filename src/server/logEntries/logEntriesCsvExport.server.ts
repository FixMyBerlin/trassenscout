import { createObjectCsvStringifier } from "csv-writer"
import { format } from "date-fns"
import type { z } from "zod"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { logEntryActionLabel } from "@/src/shared/logEntries/logEntryAction"
import type { GetLogEntriesSchema } from "./logEntries.inputSchemas"
import { getLogEntries } from "./logEntries.server"
import type { LogEntryRow } from "./types"

type ExportColumn = {
  id: string
  title: string
  value: (entry: LogEntryRow) => string
}

/** The columns the table shows, including the two only an admin gets. */
function exportColumns(isAdmin: boolean): ExportColumn[] {
  const columns: ExportColumn[] = [
    { id: "datum", title: "Datum", value: (entry) => format(entry.createdAt, "dd.MM.yyyy HH:mm") },
    { id: "aktion", title: "Aktion", value: (entry) => logEntryActionLabel[entry.action] },
    { id: "details", title: "Details", value: (entry) => entry.message ?? "" },
    { id: "projekt", title: "Projekt", value: (entry) => entry.projectSlug ?? "" },
  ]

  if (isAdmin) {
    columns.push(
      {
        id: "name",
        title: "Name",
        value: (entry) => (entry.user ? (getFullnameWithInstitution(entry.user) ?? "") : ""),
      },
      {
        id: "objektdaten",
        title: "Objektdaten",
        value: (entry) => (entry.changes ? JSON.stringify(entry.changes) : ""),
      },
    )
  }

  return columns
}

function exportFilename(projectSlug: string | undefined) {
  const date = format(new Date(), "yyyy-MM-dd")

  return `Log-Eintraege_${projectSlug ?? "alle-projekte"}_${date}.csv`
}

export async function exportLogEntriesCsv(
  headers: Headers,
  input: z.infer<typeof GetLogEntriesSchema>,
) {
  endpointAuth.inherited("auth enforced in getLogEntries")

  // Same query as the page, so the file holds exactly the rows the filter shows.
  const { isAdmin, logEntries } = await getLogEntries(headers, input)

  const columns = exportColumns(isAdmin)
  const csvStringifier = createObjectCsvStringifier({
    header: columns.map(({ id, title }) => ({ id, title })),
    fieldDelimiter: ";",
    alwaysQuote: true,
  })
  const rows = logEntries.map((entry) =>
    Object.fromEntries(columns.map((column) => [column.id, column.value(entry)])),
  )

  return new Response(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${exportFilename(input.projectSlug)}`,
    },
  })
}
