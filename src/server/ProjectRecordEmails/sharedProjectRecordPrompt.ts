export function createFieldInstructions({
  subsections,
  projectRecordTopics,
  isReprocessing,
  hasUploads,
}: {
  subsections: Array<{ id: number; slug: string; start: string; end: string }>
  projectRecordTopics: Array<{ id: number; title: string }>
  isReprocessing: boolean
  hasUploads: boolean
}) {
  return `
#### BODY
- Summarize the content of the ${isReprocessing ? "record entry" : "email body"} **once**.${isReprocessing ? " Current record entry itself is the MOST IMPORTANT source." : ""}
- Do not leave out any important details.
${hasUploads ? `- Integrate relevant information from the document summaries provided above. They are **secondary** to the main ${isReprocessing ? "record entry" : "email"}. Every document summary should be reviewed and relevant content included.` : ""}
- Convert to **Markdown**:
  - Use **bold** for key terms or names.
  - Use ## Headings for sections or topics.
  - Convert links into Markdown link format: [example](https://www.example.de).

#### DATE
- Extract the most relevant or explicitly mentioned date, like a deadline.${!isReprocessing ? "\n- If none is found, use the original sent date of the email." : ""}
- If no date can be determined, return null.
- Output in ISO 8601 format if possible.

#### TITLE
- Generate a meaningful, concise title that reflects the ${isReprocessing ? "record's" : "email's"} main topic or purpose.

#### SUBSECTIONID
${
  subsections.length > 0
    ? `Identify whether this ${isReprocessing ? "record" : "email"} content relates to a specific route subsection ('Abschnitt' / 'Planungsabschnitt' / 'Bauabschnitt'). ${hasUploads ? `The related document summaries must be considered as well.` : ""}

Available subsections:
${subsections
  .map((s) => `${s.id} (${s.slug.toUpperCase()} - ${s.start}(start) to ${s.end}(end))`)
  .join(", ")}

Match based on route sections, kilometer markers, street names, or geographic references. If unclear, return null.`
    : "No subsections available for this project; always return null."
}

#### TOPICS
${
  projectRecordTopics.length > 0
    ? `Select all relevant topic IDs from the list below based on the email's content, themes, or keywords. ${hasUploads ? `The related document summaries must be considered as well.` : ""}
Available topics:
${projectRecordTopics.map((t) => `${t.id} (${t.title})`).join(", ")}

If no topic clearly applies, return an empty array.`
    : "No topics are defined for this project; return an empty array."
}

---

Do not include any explanations or commentary.
`
}
