/**
 * OHV-only subsubsection CSV (project slug `ohv`). Fixed six-column layout;
 * other projects use subsubsectionCsvExport.server.ts.
 */

import { createObjectCsvStringifier } from "csv-writer"
import { format } from "date-fns"
import communes from "@/src/components/beteiligung/surveys/ohv-haltestellenfoerderung/communes_bboxes.json"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import {
  calculateEligibleGrantCosts,
  sumCostStructure,
} from "@/src/shared/subsubsections/costAndFundingFields"

const exportInclude = {
  subsection: { select: { slug: true } },
  SubsubsectionInfrastructureTypes: { select: { title: true } },
} satisfies Prisma.SubsubsectionInclude

type ExportRow = Prisma.SubsubsectionGetPayload<{
  include: typeof exportInclude
}>

const communeNameById = new Map(communes.map((commune) => [commune.id, commune.name]))

function communeName(subsectionSlug: string) {
  return communeNameById.get(subsectionSlug.toLowerCase()) ?? subsectionSlug
}

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined) return ""
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function toCsvString(rows: ExportRow[]) {
  const headers = [
    { id: "vorgangsId", title: "Vorgangs-ID" },
    { id: "kommune", title: "Kommune" },
    { id: "foerdergegenstaende", title: "Fördergegenstände" },
    { id: "gesamtkosten", title: "Gesamtkosten" },
    { id: "zuwendungsfaehigeKosten", title: "zuwendungsfähige Kosten" },
    { id: "zuwendungLandkreis", title: "Zuwendung des Landkreises" },
  ]

  const csvData = rows.map((s) => ({
    vorgangsId: s.slug,
    kommune: communeName(s.subsection.slug),
    foerdergegenstaende: s.SubsubsectionInfrastructureTypes.map((type) => type.title).join("; "),
    gesamtkosten: formatAmount(sumCostStructure(s)),
    zuwendungsfaehigeKosten: formatAmount(calculateEligibleGrantCosts(s)),
    zuwendungLandkreis: formatAmount(s.grantAmount),
  }))

  const csvStringifier = createObjectCsvStringifier({
    header: headers,
    fieldDelimiter: ";",
    alwaysQuote: true,
  })

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData)
}

function csvFilename(projectSlug: string, subsectionSlug?: string) {
  const date = format(new Date(), "yyyy-MM-dd")
  if (subsectionSlug) {
    return `${projectSlug}_Planungsabschnitt_${subsectionSlug}_Eintraege_${date}.csv`
  }
  return `${projectSlug}_Projekt_Alle-Eintraege_${date}.csv`
}

function csvResponse(csvString: string, filename: string) {
  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  })
}

async function loadSubsubsections(projectSlug: string, subsectionSlug?: string) {
  return db.subsubsection.findMany({
    where: {
      subsection: {
        project: { slug: projectSlug },
        ...(subsectionSlug ? { slug: subsectionSlug } : {}),
      },
    },
    include: exportInclude,
    orderBy: subsectionSlug ? { slug: "asc" } : [{ subsection: { slug: "asc" } }, { slug: "asc" }],
  })
}

export async function exportOhvSubsubsectionCsv(
  headers: Headers,
  projectSlug: string,
  subsectionSlug?: string,
) {
  await endpointAuth.projectRole(headers, projectSlug, viewerRoles)

  const rows = await loadSubsubsections(projectSlug, subsectionSlug)
  const csvString = toCsvString(rows)
  const filename = csvFilename(projectSlug, subsectionSlug)

  return csvResponse(csvString, filename)
}
