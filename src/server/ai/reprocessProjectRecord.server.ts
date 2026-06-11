import { generateText, NoObjectGeneratedError, Output } from "ai"
import { gpt5Mini } from "@/src/components/core/ai/models"
import type { Upload } from "@/src/prisma/generated/browser"
import {
  createProjectRecordExtractionSchema,
  type CreateProjectRecordExtractionSchemaParams,
} from "@/src/server/ai/projectRecordExtractionSchema"
import { createFieldInstructions } from "@/src/server/ai/projectRecordPrompt"
import { runWithLangfuseAiObservation } from "@/src/server/observability/langfuseObservation.server"

type ReprocessProjectRecordWithAiParams = {
  projectRecordBody: string
  emailBody: string | null
  uploads: Pick<Upload, "id" | "title" | "summary">[]
  projectContext: Pick<CreateProjectRecordExtractionSchemaParams, "projectRecordTopics">
  userId: string | number
  subject?: string | null
  from?: string | null
}

export async function reprocessProjectRecordWithAi({
  projectRecordBody,
  emailBody,
  uploads,
  projectContext,
  userId,
  subject,
  from,
}: ReprocessProjectRecordWithAiParams) {
  console.log("Generating project record with AI...")

  return runWithLangfuseAiObservation({
    name: "reprocess-project-record",
    userId: String(userId),
    fn: async () => {
      const { projectRecordTopics } = projectContext

      const finalExtractionSchema = createProjectRecordExtractionSchema({
        projectRecordTopics,
        isReprocessing: true,
      })

      const fieldInstructions = createFieldInstructions({
        projectRecordTopics,
        isReprocessing: true,
        hasUploads: uploads.length > 0,
        subject,
      })

      let uploadsContext = ""
      if (uploads.length > 0) {
        uploadsContext = `

    ---

### RELATED DOCUMENTS (less important)

`
        for (const upload of uploads) {
          uploadsContext += `- **${upload.title}**`
          if (upload.summary) {
            uploadsContext += `\n  Summary: ${upload.summary}`
          }
          uploadsContext += "\n"
        }
      }

      try {
        const { output: finalResult } = await generateText({
          model: gpt5Mini,
          output: Output.object({ schema: finalExtractionSchema }),
          experimental_telemetry: {
            isEnabled: true,
            functionId: "reprocess-project-record-function",
          },
          system: "You are an AI assistant that can refine project record entries.",
          prompt: `### PROJECT RECORD

**Current record entry (IMPORTANT!):**
${subject ? `SUBJECT: ${subject}\n` : ""}${from ? `FROM: ${from}\n` : ""}

${projectRecordBody}

${emailBody ? `**Original Email Body (from which the current record entry was generated):**\n${subject ? `SUBJECT: ${subject}\n` : ""}${emailBody}\n` : ""}
${uploadsContext}

---

### CONTEXT
Your task is to extract structured information to refine a **project record entry** for a task manager application.

---

### TASK
Analyze the current record entry ${emailBody ? " and original email body" : ""} ${uploads.length > 0 ? " and related document summaries" : ""} and identify the following fields:

${fieldInstructions}
`,
        })

        console.log("=== AI REPROCESSING RESULT ===")
        console.log(JSON.stringify(finalResult, null, 2))
        console.log("==============================")

        return finalResult
      } catch (error) {
        if (NoObjectGeneratedError.isInstance(error)) {
          console.log("NoObjectGeneratedError")
          console.log("Cause:", error.cause)
          console.log("Text:", error.text)
          console.log("Response:", error.response)
          console.log("Usage:", error.usage)
        }
        console.error("Error in AI reprocessing:", error)
        throw error
      }
    },
  })
}
