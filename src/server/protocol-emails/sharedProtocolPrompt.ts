export function createFieldInstructions({
  subsections,
  protocolTopics,
  isReprocessing,
  hasUploads,
}: {
  subsections: Array<{ id: number; slug: string; start: string; end: string }>
  protocolTopics: Array<{ id: number; title: string }>
  isReprocessing: boolean
  hasUploads: boolean
}) {
  return `
#### BODY
- Summarize the content of the ${isReprocessing ? "protocol" : "email"} **once**.${isReprocessing ? " Current Protocol Body is the MOST IMPORTANT source." : ""}
- Do not leave out any important details.
${hasUploads ? `Enhance the content by incorporating relevant information from the document summaries provided above. They are LESS IMPORTANT than the protocol body! All documents must be considered, use information from EVERY document summary.` : ""}
- Convert to **Markdown**:
  - Use **bold** for key terms or names.
  - Use ## Headings for sections or topics.
  - Convert links into Markdown link format: [example](https://www.example.de).

#### DATE
- Extract the most relevant or explicitly mentioned date, like a deadline.${!isReprocessing ? "\n- If none is found, use the original sent date of the email." : ""}
- If no date can be determined, return null.
- Output in ISO 8601 format if possible.

#### TITLE
- Generate a meaningful, concise title that reflects the ${isReprocessing ? "protocol's" : "email's"} main topic or purpose.

#### SUBSECTIONID
${
  subsections.length > 0
    ? `Identify whether this ${isReprocessing ? "protocol" : "email"} content relates to a specific route subsection ('Abschnitt' / 'Planungsabschnitt' / 'Bauabschnitt'). ${hasUploads ? `The related document summaries must be considered as well.` : ""}

Available subsections:
${subsections
  .map((s) => `${s.id} (${s.slug.toUpperCase()} - ${s.start}(Start) bis ${s.end}(Ende))`)
  .join(", ")}

Match based on route sections, kilometer markers, street names, or geographic references. If unclear, return null.`
    : "No subsections available for this project; always return null."
}

#### PROTOCOLTOPICS
${
  protocolTopics.length > 0
    ? `Select all relevant topic IDs from the list below based on the email's content, themes, or keywords. ${hasUploads ? `The related document summaries must be considered as well.` : ""}
Available protocol topics:
${protocolTopics.map((t) => `${t.id} (${t.title})`).join(", ")}

If no topic clearly applies, return an empty array.`
    : "No protocol topics are defined for this project; return an empty array."
}

---

Do not include any explanations or commentary.
`
}
