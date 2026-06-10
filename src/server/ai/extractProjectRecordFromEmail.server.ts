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
  projectContext: Pick<CreateProjectRecordExtractionSchemaParams, "projectRecordTopics">
  userId: string
}

export async function extractProjectRecordFromEmail({
  body,
  subject,
  from,
  projectContext,
  userId,
}: ExtractProjectRecordFromEmailParams) {
  return runWithLangfuseAiObservation({
    name: "process-email-to-project-record",
    userId,
    fn: async () => {
      const finalExtractionSchema = createProjectRecordExtractionSchema({
        projectRecordTopics: projectContext.projectRecordTopics,
      })
      const fieldInstructions = createFieldInstructions({
        projectRecordTopics: projectContext.projectRecordTopics,
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

### TASK
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
