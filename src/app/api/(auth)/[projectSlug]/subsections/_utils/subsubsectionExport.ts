import { subsubsectionLocationLabelMap } from "@/src/core/utils/subsubsectionLocationLabelMap"
import type { Prisma } from "@prisma/client"
import { createObjectCsvStringifier } from "csv-writer"
import { format } from "date-fns"

export const subsubsectionExportInclude = {
  manager: { select: { firstName: true, lastName: true } },
  subsection: {
    select: {
      slug: true,
      networkHierarchy: { select: { title: true } },
    },
  },
  SubsubsectionTask: { select: { title: true } },
  SubsubsectionStatus: { select: { title: true } },
  SubsubsectionInfra: { select: { title: true } },
  SubsubsectionInfrastructureType: { select: { title: true } },
} satisfies Prisma.SubsubsectionInclude

export type SubsubsectionExportRow = Prisma.SubsubsectionGetPayload<{
  include: typeof subsubsectionExportInclude
}>

const columns = {
  titel: {
    title: "Titel",
    value: (s: SubsubsectionExportRow) => s.slug,
  },
  status: {
    title: "Status",
    value: (s: SubsubsectionExportRow) => s.SubsubsectionStatus?.title || "",
  },
  eintragstyp: {
    title: "Eintragstyp",
    value: (s: SubsubsectionExportRow) => s.SubsubsectionTask?.title || "",
  },
  ausbaustandard: {
    title: "Ausbaustandard",
    value: (s: SubsubsectionExportRow) => s.subsection.networkHierarchy?.title || "",
  },
  ansprechpartner: {
    title: "Ansprechpartner:in",
    value: (s: SubsubsectionExportRow) =>
      s.manager ? `${s.manager.firstName} ${s.manager.lastName}` : "",
  },
  kostenschaetzung_euro: {
    title: "Kostenschätzung (Euro)",
    value: (s: SubsubsectionExportRow) => s.costEstimate?.toString() || "",
  },
  planungsabschnitt: {
    title: "Planungsabschnitt",
    value: (s: SubsubsectionExportRow) => s.subsection.slug,
  },
  laenge_m: {
    title: "Länge (m)",
    value: (s: SubsubsectionExportRow) => s.lengthM?.toString() || "",
  },
  breite_m: {
    title: "Breite (m)",
    value: (s: SubsubsectionExportRow) => s.width?.toString() || "",
  },
  beschreibung: {
    title: "Beschreibung",
    value: (s: SubsubsectionExportRow) => s.description || "",
  },
  fuehrungsform: {
    title: "Führungsform",
    value: (s: SubsubsectionExportRow) => s.SubsubsectionInfra?.title || "",
  },
  foerdergegenstand: {
    title: "Fördergegenstand",
    value: (s: SubsubsectionExportRow) => s.SubsubsectionInfrastructureType?.title || "",
  },
  lage: {
    title: "Lage",
    value: (s: SubsubsectionExportRow) => {
      return (s.location && subsubsectionLocationLabelMap[s.location]) ?? ""
    },
  },
  fertigstellung: {
    title: "Fertigstellung",
    value: (s: SubsubsectionExportRow) => s.estimatedCompletionDate || "",
  },
} as const

export function subsubsectionsToCsvString(subsubsections: SubsubsectionExportRow[]) {
  const headers = Object.entries(columns).map(([id, { title }]) => ({ id, title }))

  const csvData = subsubsections.map((s) =>
    Object.fromEntries(Object.entries(columns).map(([id, col]) => [id, col.value(s)])),
  )

  const csvStringifier = createObjectCsvStringifier({
    header: headers,
    fieldDelimiter: ";",
    alwaysQuote: true,
  })

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData)
}

/**
 * Filename for CSV export. Pass subsectionSlug for plan-section-level export,
 * omit for project-level (all entries) export, so both are distinguishable in the file system.
 */
export function subsubsectionExportFilename(projectSlug: string, subsectionSlug?: string) {
  const date = format(new Date(), "yyyy-MM-dd")
  if (subsectionSlug) {
    return `${projectSlug}_Planungsabschnitt_${subsectionSlug}_Eintraege_${date}.csv`
  }
  return `${projectSlug}_Projekt_Alle-Eintraege_${date}.csv`
}

export function subsubsectionCsvResponse(csvString: string, filename: string) {
  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  })
}
