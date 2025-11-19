type CreateFieldInstructionsParams = {
  subsections: Array<{ id: number; slug: string; start: string; end: string }>
  subsubsections: Array<{ id: number; slug: string; subsection: { slug: string; id: number } }>
  projectRecordTopics: Array<{ id: number; title: string }>
  isReprocessing?: boolean
  hasUploads: boolean
  subject?: string | null
}

export const createFieldInstructions = ({
  subsections,
  subsubsections,
  projectRecordTopics,
  isReprocessing,
  hasUploads,
  subject,
}: CreateFieldInstructionsParams) => {
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
- Generate a meaningful, concise title that reflects the ${isReprocessing ? "record's" : "email's"} main topic or purpose.${!isReprocessing && subject ? `\n- **Important:** The email subject is "${subject}". Use this as the primary source for the title.` : ""}

#### SUBSECTIONID
${
  subsections.length > 0
    ? `Identify whether this ${isReprocessing ? "record" : "email"} content relates to a specific route subsection ('Abschnitt' / 'Planungsabschnitt' / 'Bauabschnitt'). ${hasUploads ? `The related document summaries must be considered as well.` : ""}

Available subsections:
${subsections
  .map((s) => `${s.id} (${s.slug.toUpperCase()} - ${s.start}(start) to ${s.end}(end))`)
  .join(", ")}

Assign based on the abbreviations mentioned in the text${subject ? ` and subject` : ""}. Sometimes the abbreviations vary slightly, e.g., 'PA1' can also be written as 'PA 1'. If unclear, return null.`
    : "No subsections available for this project; always return null."
}

#### SUBSUBSECTIONID
${
  subsubsections.length > 0
    ? `Identify whether this ${isReprocessing ? "record" : "email"} content relates to a specific route subsubsection ('Maßnahme', 'Unterabschnitt', 'Führung'). ${hasUploads ? `The related document summaries must be considered as well.` : ""}

Available subsubsections:
${subsubsections
  .map(
    (s) =>
      `${s.id} (short title: ${s.slug.toUpperCase()} - part of subsection ${s.subsection.slug.toUpperCase()})`,
  )
  .join(", ")}

Assign based on the abbreviations mentioned in the text${subject ? ` and subject` : ""}. Sometimes the abbreviations vary slightly, e.g., 'RF12' can also be written as 'RF 12'. If unclear, return null.`
    : "No subsubsections available for this project; always return null."
}

#### TOPICS
${
  projectRecordTopics.length > 0
    ? `Select all relevant topic IDs from the list below based on the ${isReprocessing ? "record" : "email"}'s content${subject ? `, subject` : ""}, themes, or keywords. ${hasUploads ? `The related document summaries must be considered as well.` : ""}
Available topics:
${projectRecordTopics.map((t) => `${t.id} (${t.title})`).join(", ")}

If no topic clearly applies, return an empty array.`
    : "No topics are defined for this project; return an empty array."
}

---

Do not include any explanations or commentary.
`
}
