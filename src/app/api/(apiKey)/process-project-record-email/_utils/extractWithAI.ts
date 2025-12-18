import { createFieldInstructions } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/sharedProjectRecordPrompt"
import {
  createProjectRecordExtractionSchema,
  CreateProjectRecordExtractionSchemaParams,
} from "@/src/app/api/(apiKey)/process-project-record-email/_utils/sharedProjectRecordSchema"
import { gpt5Mini } from "@/src/core/ai/models"
import { generateObject, NoObjectGeneratedError } from "ai"
import { langfuse } from "./langfuseClient"

type ExtractWithAIParams = {
  body: string
  subject?: string | null
  from?: string | null
  projectContext: Pick<
    CreateProjectRecordExtractionSchemaParams,
    /*  "subsections" | "subsubsections" |*/ "projectRecordTopics"
  >
  userId: string
}

// tbd
// subsubsections: should we filter by subsection?
// we might want a pipeline where we first find the matching subsection and then only fetch subsubsections for that subsection
// do we want to fetch more data (like Führungsform etc.) to improve matching?

export const extractWithAI = async ({
  body,
  subject,
  from,
  projectContext,
  userId,
}: ExtractWithAIParams) => {
  const trace = langfuse.trace({
    name: "process-email-to-project-record",
    userId,
  })

  const finalExtractionSchema = createProjectRecordExtractionSchema({
    // subsections: projectContext.subsections,
    // subsubsections: projectContext.subsubsections,
    projectRecordTopics: projectContext.projectRecordTopics,
  })
  const fieldInstructions = createFieldInstructions({
    // subsections: projectContext.subsections,
    // subsubsections: projectContext.subsubsections,
    projectRecordTopics: projectContext.projectRecordTopics,
    isReprocessing: false,
    hasUploads: false, // attachments are uploaded but not yet used in prompt for initial processing
    subject,
  })

  let finalResult
  try {
    const result = await generateObject({
      model: gpt5Mini,
      schema: finalExtractionSchema,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "process-email-to-project-record-function",
        metadata: {
          langfuseTraceId: trace.id,
        },
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
    finalResult = result.object
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

  console.log("AI extraction result:", JSON.stringify(finalResult, null, 2))

  return finalResult
}
