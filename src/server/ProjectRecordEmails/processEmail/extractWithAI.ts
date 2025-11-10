import { gpt5Mini } from "@/src/core/ai/models"
import { fetchProjectContext } from "@/src/server/ProjectRecordEmails/processEmail/fetchProjectContext"
import { createFieldInstructions } from "@/src/server/ProjectRecordEmails/sharedProjectRecordPrompt"
import { createProjectRecordExtractionSchema } from "@/src/server/ProjectRecordEmails/sharedProjectRecordSchema"
import { generateObject, NoObjectGeneratedError } from "ai"
import { langfuse } from "./langfuseClient"

type ExtractWithAIParams = {
  emailBody: string
  projectContext: Awaited<ReturnType<typeof fetchProjectContext>>
  userId: string
}

export const extractWithAI = async ({ emailBody, projectContext, userId }: ExtractWithAIParams) => {
  const trace = langfuse.trace({
    name: "process-protocol-email",
    userId,
  })

  const finalExtractionSchema = createProjectRecordExtractionSchema({
    subsections: projectContext.subsections,
    subsubsections: projectContext.subsubsections,
    projectRecordTopics: projectContext.projectRecordTopics,
  })
  const fieldInstructions = createFieldInstructions({
    subsections: projectContext.subsections,
    subsubsections: projectContext.subsubsections,
    projectRecordTopics: projectContext.projectRecordTopics,
    isReprocessing: false,
    hasUploads: false, // attachments are uploaded but not yet used in prompt for initial processing
  })

  let finalResult
  try {
    const result = await generateObject({
      model: gpt5Mini,
      schema: finalExtractionSchema,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "process-protocol-email-function",
        metadata: {
          langfuseTraceId: trace.id,
        },
      },
      system:
        "You are an AI assistant that can read and process emails and gather information from them.",
      prompt: `EMAIL BODY:
${emailBody}

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
    finalResult = result.object
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.log("NoObjectGeneratedError")
      console.log("Cause:", error.cause)
      console.log("Text:", error.text)
      console.log("Response:", error.response)
      console.log("Usage:", error.usage)
    }
    console.error("Error in AI processing (stage 2):", error)
    throw new Error("Failed to process email with AI")
  }

  console.log("AI extraction result:", JSON.stringify(finalResult, null, 2))

  return finalResult
}
