import { gpt5Mini } from "@/src/core/ai/models"
import { createFieldInstructions } from "@/src/server/ProjectRecordEmails/sharedProjectRecordPrompt"
import {
  createProjectRecordExtractionSchema,
  CreateProjectRecordExtractionSchemaParams,
} from "@/src/server/ProjectRecordEmails/sharedProjectRecordSchema"
import { langfuse } from "@/src/server/uploads/summarize/langfuseClient"
import { Upload } from "@prisma/client"
import { generateObject } from "ai"

type GenerateProjectRecordWithAIParams = {
  projectRecordBody: string
  emailBody: string | null
  uploads: Pick<Upload, "id" | "title" | "summary">[]
  projectContext: Pick<
    CreateProjectRecordExtractionSchemaParams,
    "subsections" | "subsubsections" | "projectRecordTopics"
  >
  userId: number
}

export const generateProjectRecordWithAI = async ({
  projectRecordBody,
  emailBody,
  uploads,
  projectContext,
  userId,
}: GenerateProjectRecordWithAIParams) => {
  console.log("Generating project record with AI...")

  const trace = langfuse.trace({
    name: "reprocess-protocol",
    userId: String(userId),
  })

  const { subsections, subsubsections, projectRecordTopics } = projectContext

  const finalExtractionSchema = createProjectRecordExtractionSchema({
    subsections,
    subsubsections,
    projectRecordTopics,
  })

  const fieldInstructions = createFieldInstructions({
    subsections,
    subsubsections,
    projectRecordTopics,
    isReprocessing: true,
    hasUploads: uploads.length > 0,
  })

  // Build uploads context
  let uploadsContext = ""
  if (uploads.length > 0) {
    uploadsContext = `

    ---

### RELATED DOCUMENTS (less important)

`
    uploads.forEach((upload) => {
      uploadsContext += `- **${upload.title}**`
      if (upload.summary) {
        uploadsContext += `\n  Summary: ${upload.summary}`
      }
      uploadsContext += "\n"
    })
  }

  const { object: finalResult } = await generateObject({
    model: gpt5Mini,
    schema: finalExtractionSchema,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "email-to-protocol-function",
      metadata: {
        langfuseTraceId: trace.id,
      },
    },
    system: "You are an AI assistant that can refine project record entries.",
    prompt: `### PROJECT RECORD

**Current record entry (IMPORTANT!):**
${projectRecordBody}

${emailBody ? `**Original Email Body (from which the current record entry was generated):**\n${emailBody}\n` : ""}
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

  await langfuse.flushAsync()

  return finalResult
}
