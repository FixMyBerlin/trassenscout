import db, { LocationEnum } from "@/db"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"
import { coordinatesToWkt } from "@/src/pages/api/survey/utils/coordinatesToWkt"
import { createObjectCsvStringifier } from "csv-writer"
import { format } from "date-fns"

export const GET = withProjectMembership(viewerRoles, async ({ params }) => {
  const { projectSlug, subsectionSlug } = params

  const subsubsections = await db.subsubsection.findMany({
    where: {
      subsection: {
        project: { slug: projectSlug },
        slug: subsectionSlug,
      },
    },
    include: {
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
      qualityLevel: { select: { title: true } },
    },
    orderBy: { slug: "asc" },
  })
  type Subsubsection = (typeof subsubsections)[number]

  const columns = {
    titel: {
      title: "Titel",
      value: (s: Subsubsection) => s.slug,
    },
    status: {
      title: "Status",
      value: (s: Subsubsection) => s.SubsubsectionStatus?.title || "",
    },
    eintragstyp: {
      title: "Eintragstyp",
      value: (s: Subsubsection) => s.SubsubsectionTask?.title || "",
    },
    ausbaustandard: {
      title: "Ausbaustandard",
      value: (s: Subsubsection) => s.subsection.networkHierarchy?.title || "",
    },
    ansprechpartner: {
      title: "Ansprechpartner:in",
      value: (s: Subsubsection) =>
        s.manager ? `${s.manager.firstName} ${s.manager.lastName}` : "",
    },
    kostenschaetzung_euro: {
      title: "Kostenschätzung (Euro)",
      value: (s: Subsubsection) => s.costEstimate?.toString() || "",
    },
    planungsabschnitt: {
      title: "Planungsabschnitt",
      value: (s: Subsubsection) => s.subsection.slug,
    },
    laenge_m: {
      title: "Länge (m)",
      value: (s: Subsubsection) => s.lengthM?.toString() || "",
    },
    breite_m: {
      title: "Breite (m)",
      value: (s: Subsubsection) => s.width?.toString() || "",
    },
    beschreibung: {
      title: "Beschreibung",
      value: (s: Subsubsection) => s.description || "",
    },
    fuehrungsform: {
      title: "Führungsform",
      value: (s: Subsubsection) => s.SubsubsectionInfra?.title || "",
    },
    lage: {
      title: "Lage",
      value: (s: Subsubsection) => {
        const labelMap: Record<keyof typeof LocationEnum, string> = {
          URBAN: "innerorts",
          RURAL: "außerorts",
        }
        return (s.location && labelMap[s.location]) ?? ""
      },
    },
    fertigstellung: {
      title: "Fertigstellung",
      value: (s: Subsubsection) =>
        s.estimatedCompletionDate ? format(new Date(s.estimatedCompletionDate), "dd.MM.yyyy") : "",
    },
    geometrie: {
      title: "Geometrie (WKT)",
      value: (s: Subsubsection) => {
        if (s.geometry) {
          return coordinatesToWkt(JSON.stringify(s.geometry)) || ""
        }
        return ""
      },
    },
  }

  const headers = Object.entries(columns).map(([id, { title }]) => ({ id, title }))

  const csvData = subsubsections.map((s) =>
    Object.fromEntries(Object.entries(columns).map(([id, col]) => [id, (col as any).value(s)])),
  )

  const csvStringifier = createObjectCsvStringifier({
    header: headers,
    fieldDelimiter: ";",
    alwaysQuote: true,
  })

  const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData)
  const filename = `${projectSlug}_Eintraege_${format(new Date(), "yyyy-MM-dd")}.csv`

  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  })
})
