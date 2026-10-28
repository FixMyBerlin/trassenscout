import { generateText, NoObjectGeneratedError, Output } from "ai"
import { gpt5Mini } from "@/src/components/core/ai/models"
import {
  createProjectRecordExtractionSchema,
  type CreateProjectRecordExtractionSchemaParams,
} from "@/src/server/ai/projectRecordExtractionSchema"
import { createFieldInstructions } from "@/src/server/ai/projectRecordPrompt"
import { runWithLangfuseAiObservation } from "@/src/server/observability/langfuseObservation.server"

type ExtractProjectRecordFromEmailParams = {
  body: string
  subject?: string | null
  from?: string | null
  projectContext: Pick<CreateProjectRecordExtractionSchemaParams, "tags">
  template?: { entryTitle: string; body: string | null; purpose: string | null } | null
  userId: string
}

const createTemplateSection = (template: ExtractProjectRecordFromEmailParams["template"]) => {
  if (!template) return ""

  return `### PROTOKOLLVORLAGE
The project record must follow the selected template (Protokollvorlage). Its rules take precedence over the general TITLE and BODY rules below.
${template.purpose ? `- Purpose of the template: ${template.purpose}\n` : ""}- TITLE: start from the template's entry title "${template.entryTitle}" and add the specific topic of the email.
${template.body ? `- BODY: fill this Markdown structure with the information from the email. Keep its headings and their order, fill placeholders and checkboxes, and write "–" under a heading when the email says nothing about it:\n\n${template.body}\n` : ""}
---

`
}

export async function extractProjectRecordFromEmail({
  body,
  subject,
  from,
  projectContext,
  template,
  userId,
}: ExtractProjectRecordFromEmailParams) {
  return runWithLangfuseAiObservation({
    name: "process-email-to-project-record",
    userId,
    fn: async () => {
      const finalExtractionSchema = createProjectRecordExtractionSchema({
        tags: projectContext.tags,
      })
      const fieldInstructions = createFieldInstructions({
        tags: projectContext.tags,
        isReprocessing: false,
        hasUploads: false,
        subject,
      })

      try {
        const { output } = await generateText({
          model: gpt5Mini,
          output: Output.object({ schema: finalExtractionSchema }),
          experimental_telemetry: {
            isEnabled: true,
            functionId: "process-email-to-project-record-function",
          },
          system:
            "You are an AI assistant that can read and process emails and gather information from them.",
          prompt: `${subject ? `EMAIL SUBJECT:\n${subject}\n\n---\n\n` : ""}${from ? `FROM:\n${from}\n\n---\n\n` : ""}EMAIL BODY:
${body}

---

### CONTEXT
This email was pre-processed to extract the plain text body. Attachments have already been separated and stored elsewhere.

It is part of a professional discussion among administrative staff and stakeholders involved in an infrastructural planning project.
Your task is to extract structured information to create a **project record entry** for a task manager application.

---

${createTemplateSection(template)}### TASK
Analyze the email and identify the following fields:

${fieldInstructions}
`,
        })

        console.log("AI extraction result:", JSON.stringify(output, null, 2))
        return output
      } catch (error) {
        if (NoObjectGeneratedError.isInstance(error)) {
          console.log("NoObjectGeneratedError")
          console.log("Cause:", error.cause)
          console.log("Text:", error.text)
          console.log("Response:", error.response)
          console.log("Usage:", error.usage)
        }
        console.error("Error in AI processing:", error)
        throw new Error("Failed to process email with AI")
      }
    },
  })
}
