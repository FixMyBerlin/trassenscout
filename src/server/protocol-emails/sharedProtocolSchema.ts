import { z } from "zod"

export function createProtocolExtractionSchema(
  subsections: Array<{ id: number; slug: string; start: string; end: string }>,
  protocolTopics: Array<{ id: number; title: string }>,
) {
  return z.object({
    body: z
      .string()
      .min(1)
      .trim()
      .describe("The full text content of the email body, formatted in clean Markdown."),

    title: z
      .string()
      .min(1)
      .max(150)
      .trim()
      .describe("A concise and meaningful title summarizing the email's main purpose or topic."),

    date: z
      .string()
      .nullable()
      .describe(
        "The relevant date (or sent date) for the protocol entry in ISO format if available.",
      ),

    subsectionId:
      subsections.length > 0
        ? z
            .enum(subsections.map((s) => s.id.toString()) as [string, ...string[]])
            .nullable()
            .describe(
              `The subsection ('Abschnitt') ID this email relates to, if applicable. Available subsections: ${subsections
                .map((s) => `${s.id} (${s.slug} - ${s.start} bis ${s.end})`)
                .join(", ")}. Return null if no clear subsection is identified.`,
            )
        : z.null().describe("Null as no subsections are available for this project."),

    protocolTopics: z
      .array(
        protocolTopics.length > 0
          ? z.enum(protocolTopics.map((t) => t.id.toString()) as [string, ...string[]])
          : z.string(),
      )
      .describe(
        protocolTopics.length > 0
          ? `Array of protocol topic IDs ('Tags') this email relates to. Available topics: ${protocolTopics
              .map((t) => `${t.id} (${t.title})`)
              .join(
                ", ",
              )}. Select all that apply based on the email's content. Return [] if none are relevant.`
          : "Empty array as no protocol topics are available for this project.",
      ),
  })
}
