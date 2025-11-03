import { z } from "zod"

export function createProjectRecordExtractionSchema({
  subsections,
  subsubsections,
  projectRecordTopics,
  isReprocessing,
}: {
  subsections: Array<{ id: number; slug: string; start: string; end: string }>
  subsubsections: Array<{ id: number; slug: string; subsectionId: number }>
  projectRecordTopics: Array<{ id: number; title: string }>
  isReprocessing?: boolean
}) {
  return z.object({
    body: z
      .string()
      .min(1)
      .trim()
      .describe(
        `The complete text content of the ${isReprocessing ? "record entry" : "email body"}, formatted in clean Markdown."`,
      ),

    title: z
      .string()
      .min(1)
      .max(150)
      .trim()
      .describe(
        `A concise and meaningful title summarizing the ${isReprocessing ? "record entry" : "email"}'s main purpose or topic.`,
      ),

    date: z
      .string()
      .nullable()
      .describe(
        "The relevant date (or sent date) for the created project record entry in ISO format if available.",
      ),

    subsectionId:
      subsections.length > 0
        ? z
            .enum(subsections.map((s) => s.id.toString()) as [string, ...string[]])
            .nullable()
            .describe(
              `The subsection ('Abschnitt') ID this ${isReprocessing ? "record entry" : "email"} relates to, if applicable. Available subsections: ${subsections
                .map((s) => `${s.id} (${s.slug} - ${s.start} to ${s.end})`)
                .join(", ")}. Return null if no clear subsection is identified.`,
            )
        : z.null().describe("Null as no subsections are available for this project."),
    subsubsectionId:
      subsubsections.length > 0
        ? z
            .enum(subsubsections.map((s) => s.id.toString()) as [string, ...string[]])
            .nullable()
            .describe(
              `The subsubsection ('Abschnitt') ID this ${isReprocessing ? "record entry" : "email"} relates to, if applicable. Available subsubsections: ${subsubsections
                .map((s) => `${s.id} (${s.slug} - part of subsection ${s.subsectionId})`)
                .join(", ")}. Return null if no clear subsubsection is identified.`,
            )
        : z.null().describe("Null as no subsubsections are available for this project."),
    topics: z
      .array(
        projectRecordTopics.length > 0
          ? z.enum(projectRecordTopics.map((t) => t.id.toString()) as [string, ...string[]])
          : z.string(),
      )
      .describe(
        projectRecordTopics.length > 0
          ? `Array of topic IDs ('Tags') this ${isReprocessing ? "record entry" : "email"} relates to. Available topics: ${projectRecordTopics
              .map((t) => `${t.id} (${t.title})`)
              .join(
                ", ",
              )}. Select all that apply based on the ${isReprocessing ? "record entry" : "email"}'s content. Return [] if none are relevant.`
          : "Empty array as no topics are available for this project.",
      ),
  })
}
