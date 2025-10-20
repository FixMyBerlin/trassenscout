import db from "@/db"
import { withProjectMembership } from "@/src/app/api/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"
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
      subsection: { select: { slug: true } },
      SubsubsectionTask: { select: { title: true } },
      SubsubsectionStatus: { select: { title: true } },
      SubsubsectionInfra: { select: { title: true } },
    },
    orderBy: { slug: "asc" },
  })

  const headers = [
    { id: "titel", title: "Titel" },
    { id: "status", title: "Status" },
    { id: "foerdergegenstand", title: "Fördergegenstand" },
    { id: "ansprechpartner", title: "Ansprechpartner:in" },
    { id: "kostenschaetzung_euro", title: "Kostenschätzung (Euro)" },
    { id: "planungsabschnitt", title: "Planungsabschnitt" },
    { id: "laenge_m", title: "Länge (m)" },
    { id: "breite_m", title: "Breite (m)" },
    { id: "beschreibung", title: "Beschreibung" },
    { id: "fuehrungsform", title: "Führungsform" },
    { id: "lage", title: "Lage" },
    { id: "fertigstellung", title: "Fertigstellung" },
  ]

  const csvData = subsubsections.map((subsubsection) => {
    const locationCode = String(subsubsection.location ?? "")
    const lage =
      locationCode.toUpperCase() === "INNERORTS"
        ? "innerorts"
        : locationCode.toUpperCase() === "OUTERORTS"
          ? "außerorts"
          : ""

    return {
      titel: subsubsection.slug,
      status: subsubsection.SubsubsectionStatus?.title || "",
      foerdergegenstand: subsubsection.SubsubsectionTask?.title || "",
      ansprechpartner: subsubsection.manager
        ? `${subsubsection.manager.firstName} ${subsubsection.manager.lastName}`
        : "",
      kostenschaetzung_euro: subsubsection.costEstimate?.toString() || "",
      planungsabschnitt: subsubsection.subsection.slug,
      laenge_m: subsubsection.lengthM?.toString() || "",
      breite_m: subsubsection.width?.toString() || "",
      beschreibung: subsubsection.description || "",
      fuehrungsform: subsubsection.SubsubsectionInfra?.title || "",
      lage,
      fertigstellung: subsubsection.estimatedCompletionDate
        ? format(new Date(subsubsection.estimatedCompletionDate), "dd.MM.yyyy")
        : "",
    }
  })

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
