import { createObjectCsvStringifier } from "csv-writer"
import { format } from "date-fns"
import { getPrdOrStgDomain } from "@/src/components/core/components/links/getDomain"
import { subsubsectionLocationLabelMap } from "@/src/components/core/utils/subsubsectionLocationLabelMap"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"

const subsubsectionExportInclude = {
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
  SubsubsectionInfrastructureTypes: { select: { title: true } },
} satisfies Prisma.SubsubsectionInclude

export type SubsubsectionExportRow = Prisma.SubsubsectionGetPayload<{
  include: typeof subsubsectionExportInclude
}>

function getExportColumns(projectSlug: string) {
  const origin = getPrdOrStgDomain()
  return {
    titel: {
      title: "Titel",
      value: (s: SubsubsectionExportRow) => s.slug,
    },
    status: {
      title: "Status",
      value: (s: SubsubsectionExportRow) => s.SubsubsectionStatus?.title || "",
    },
    eintragstyp: {
      title: "Maßnahmentyp",
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
      value: (s: SubsubsectionExportRow) =>
        s.SubsubsectionInfrastructureTypes.map((type) => type.title).join(", "),
    },
    lage: {
      title: "Lage",
      value: (s: SubsubsectionExportRow) =>
        (s.location && subsubsectionLocationLabelMap[s.location]) ?? "",
    },
    fertigstellung: {
      title: "Fertigstellung",
      value: (s: SubsubsectionExportRow) => s.estimatedCompletionDate || "",
    },
    trassenscout_url: {
      title: "trassenscout_url",
      value: (s: SubsubsectionExportRow) =>
        new URL(
          `/${projectSlug}/abschnitte/${s.subsection.slug}/fuehrung/${s.slug}`,
          origin,
        ).toString(),
    },
  }
}

function subsubsectionsToCsvString(subsubsections: SubsubsectionExportRow[], projectSlug: string) {
  const columns = getExportColumns(projectSlug)
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

function subsubsectionExportFilename(projectSlug: string, subsectionSlug?: string) {
  const date = format(new Date(), "yyyy-MM-dd")
  if (subsectionSlug) {
    return `${projectSlug}_Planungsabschnitt_${subsectionSlug}_Eintraege_${date}.csv`
  }
  return `${projectSlug}_Projekt_Alle-Eintraege_${date}.csv`
}

function subsubsectionCsvResponse(csvString: string, filename: string) {
  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  })
}

export async function exportProjectSubsubsectionsCsv(headers: Headers, projectSlug: string) {
  await endpointAuth.projectMember({
    headers,
    projectSlug,
    roles: viewerRoles,
  })

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        project: { slug: projectSlug },
      },
    },
    include: subsubsectionExportInclude,
    orderBy: [{ subsection: { slug: "asc" } }, { slug: "asc" }],
  })

  const csvString = subsubsectionsToCsvString(subsubsections, projectSlug)
  const filename = subsubsectionExportFilename(projectSlug)

  return subsubsectionCsvResponse(csvString, filename)
}

export async function exportSubsectionSubsubsectionsCsv(
  headers: Headers,
  projectSlug: string,
  subsectionSlug: string,
) {
  await endpointAuth.projectMember({
    headers,
    projectSlug,
    roles: viewerRoles,
  })

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        project: { slug: projectSlug },
        slug: subsectionSlug,
      },
    },
    include: subsubsectionExportInclude,
    orderBy: { slug: "asc" },
  })

  const csvString = subsubsectionsToCsvString(subsubsections, projectSlug)
  const filename = subsubsectionExportFilename(projectSlug, subsectionSlug)

  return subsubsectionCsvResponse(csvString, filename)
}
