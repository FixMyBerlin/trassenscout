import { model } from "@/src/core/ai/models"
import { generateText } from "ai"
import {
  createProjectContextPromptSection,
  CreateProjectContextPromptSectionParams,
} from "./createProjectContextPromptSection"
import { langfuse } from "./langfuseClient"

type GeneratePdfSummaryWithAIParams = {
  pdfData: Buffer
  userId: number
  projectContext: CreateProjectContextPromptSectionParams
}

export const generatePdfSummaryWithAI = async ({
  pdfData,
  userId,
  projectContext,
}: GeneratePdfSummaryWithAIParams) => {
  console.log("Generating summary with AI...")

  const trace = langfuse.trace({
    name: "summarize-upload",
    userId: String(userId),
  })

  const projectContextSection = createProjectContextPromptSection(projectContext)

  const prompt = `# Task: Create Document Summary

## Summary Requirements
Create a concise summary of the following PDF document. Capture the main points and insights of the document with these specifications:

### Language and Style
- Write the summary in **German**
- Focus on clarity and conciseness

### Formatting
- Use Markdown formatting for better readability:
  - Use **bold** for emphasis
  - Use *italic* where appropriate
  - Use lists for structured information
  - Format links as inline links: [example.com](https://www.example.com/)
${projectContextSection}
`

  const { text } = await generateText({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "file", data: pdfData, mimeType: "application/pdf" }],
      },
    ],
    experimental_telemetry: {
      isEnabled: true,
      functionId: "summarize-upload-function",
      metadata: {
        langfuseTraceId: trace.id,
      },
    },
  })

  console.log("AI Summary generated successfully")
  console.log("Summary:", text)

  await langfuse.flushAsync()

  return text
}
