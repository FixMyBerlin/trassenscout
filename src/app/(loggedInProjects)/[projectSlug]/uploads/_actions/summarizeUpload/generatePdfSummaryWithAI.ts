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
  projectContext: CreateProjectContextPromptSectionParams["projectContext"]
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

  const projectContextSection = createProjectContextPromptSection({ projectContext })

  const prompt = `# Task: Create Document Summary

## Summary Requirements
Create a concise summary of the document. Capture the main points and insights of the document with these specifications:

### Language and Style
- Write the summary in **German**
- Focus on clarity and conciseness

### Documents Without Sufficient Text
- If the document contains only images or insufficient text for a meaningful summary, respond with: "Das Dokument enthält nicht auswertbaren Inhalt für eine KI-gestützte Zusammenfassung"

### Formatting: Use Markdown formatting for better readability:
- Use ## Headings for sections or topics
- Use lists for structured information
- Convert links into Markdown link format: [example](https://www.example.de)
- Do not use bold formatting in running text
- Write in gender-neutral German, preferring neutral participle forms (e.g., Bearbeitende) and otherwise using colon forms (e.g., Nutzer:innen, Autor:in)
- When referring to pages, use the absolute page count (not printed page numbers)


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
