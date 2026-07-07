type CreateFieldInstructionsParams = {
  tags: Array<{ id: number; title: string }>
  isReprocessing?: boolean
  hasUploads: boolean
  subject?: string | null
}

export const createFieldInstructions = ({
  tags,
  isReprocessing,
  hasUploads,
  subject,
}: CreateFieldInstructionsParams) => {
  return `
#### BODY
- Summarize the content of the ${isReprocessing ? "record entry" : "email body"}  - **once and in German language**.${isReprocessing ? " Current record entry itself is the MOST IMPORTANT source." : ""}
- Do not leave out any important details.
${hasUploads ? `- Integrate relevant information from the document summaries provided above. They are **secondary** to the main ${isReprocessing ? "record entry" : "email"}. Every document summary should be reviewed and relevant content included.` : ""}
- Convert to **Markdown**:
  - Use ## Headings for sections or topics
  - Use lists for structured information
  - Convert links into Markdown link format: [example](https://www.example.de)
  - Do not use bold formatting in running text
  - Write in gender-neutral German, preferring neutral participle forms (e.g., Bearbeitende) and otherwise using colon forms (e.g., Nutzer:innen, Autor:in)

#### DATE
- Extract the most relevant or explicitly mentioned date, like a deadline.${!isReprocessing ? "\n- If none is found, use the original sent date of the email." : ""}
- If no date can be determined, return null.
- Output in ISO 8601 format if possible.

#### TITLE
- Generate a meaningful, concise title that reflects the ${isReprocessing ? "record's" : "email's"} main topic or purpose **in German language**.${!isReprocessing && subject ? `\n- **Important:** The email subject is "${subject}". Use this as the primary source for the title.` : ""}

#### TOPICS
${
  tags.length > 0
    ? `Select all relevant topic IDs from the list below based on the ${isReprocessing ? "record" : "email"}'s content${subject ? `, subject` : ""}, themes, or keywords. ${hasUploads ? `The related document summaries must be considered as well.` : ""}
Available topics:
${tags.map((t) => `${t.id} (${t.title})`).join(", ")}

If no topic clearly applies, return an empty array.`
    : "No topics are defined for this project; return an empty array."
}

---

Do not include any explanations or commentary.
`
}
