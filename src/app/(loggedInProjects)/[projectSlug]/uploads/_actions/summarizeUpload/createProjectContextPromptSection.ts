export type CreateProjectContextPromptSectionParams = {
  projectContext: {
    subsections: { id: number; slug: string }[] | null
    subsubsections: { id: number; slug: string; subsection: { id: number; slug: string } }[] | null
    projectRecordTopics: { id: number; title: string }[]
  }
}

export const createProjectContextPromptSection = ({
  projectContext,
}: CreateProjectContextPromptSectionParams) => {
  if (!projectContext) {
    return ""
  }

  const { subsections, subsubsections, projectRecordTopics } = projectContext

  return `

---

## Project Context and Important Information

When summarizing this document, pay special attention to the following:

### GENERAL REQUIREMENTS (Always Include **if mentioned**)
- **Topics**: Always identify and include the most relevant topics or themes in the summary, even if they are not in the predefined project topics list below.
- **Route Section Names**: Always include any route section names, abbreviations, or identifiers mentioned (e.g., 'PA1', 'Planungsabschnitt 2', 'Bauabschnitt 3').
- **⚠️ IMPORTANT - Geographic Information**: Always include all names of routes, municipalities (Gemeinden), cities (Städte), districts (Ortsteile), streets (Straßen), and places of any kind mentioned in the document. These are critical reference points and must never be omitted. Do not merge, interpret, or generalize locations (e.g. do not replace street names with city names).
- do **not** guess or invent information: only include route Section Names, geo information and topics if they explicitly mentioned

### PREDEFINED TOPICS
${
  projectRecordTopics.length > 0
    ? `This project has the following predefined topics for reference:
${projectRecordTopics.map((t) => `- ${t.title}`).join("\n")}

If the document relates to any of these topics, mention them explicitly in the summary. However, also identify and include other relevant topics not in this list.`
    : "No predefined topics for this project. Identify and include the most relevant topics from the document content."
}
${
  // If subsections is null: section is completely omitted from prompt
  // If subsections is empty array []: section appears with "No predefined subsections" message
  // If subsections has items: section appears with the list of subsections
  subsections !== null
    ? `
### PREDEFINED SUBSECTIONS (Route Sections / Planungsabschnitte / Bauabschnitte / Abschnitte)
${
  subsections.length > 0
    ? `This project has the following predefined route subsections:
${subsections.map((s) => `- **${s.slug.toUpperCase()}**`).join("\n")}

If the document mentions any of these subsection abbreviations (e.g., 'PA1', 'BA 1', 'Abschnitt 1'), include them in the summary with their proper designation. Also include any other route section references not in this list.`
    : "No predefined subsections for this project. Still identify and include any route section names or abbreviations mentioned in the document."
}`
    : ""
}
${
  // If subsubsections is null: section is completely omitted from prompt
  // If subsubsections is empty array []: section appears with "No predefined subsubsections" message
  // If subsubsections has items: section appears with the list of subsubsections
  subsubsections !== null
    ? `
### PREDEFINED SUBSUBSECTIONS (Route Subsubsections / Maßnahmen / Unterabschnitte / Führungen / Einträge)
${
  subsubsections.length > 0
    ? `This project has the following predefined route subsubsections:
${subsubsections
  .map(
    (s) => `- **${s.slug.toUpperCase()}** (part of subsection ${s.subsection.slug.toUpperCase()})`,
  )
  .join("\n")}

If the document mentions any of these subsubsection abbreviations, include them in the summary with their proper designation. Also include any other route subsubsection references not in this list.`
    : "No predefined subsubsections for this project. Still identify and include any route subsubsection names or abbreviations (e.g., 'RF12', 'DIE05_P12') mentioned in the document."
}`
    : ""
}

---
`
}
