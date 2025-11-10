import { model } from "@/src/core/ai/models"
import { generateText } from "ai"
import { langfuse } from "./langfuseClient"

export const generatePdfSummaryWithAI = async (pdfData: Buffer, userId: number) => {
  console.log("Generating summary with AI...")

  const trace = langfuse.trace({
    name: "summarize-upload",
    userId: String(userId),
  })

  const { text } = await generateText({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Create a concise summary of the following PDF document. The summary should be written in German and capture the main points and insights of the document. Focus on clarity and conciseness. Use Markdown formatting for better readability (e.g., **bold**, *italic*, lists, etc.). Format links as inline links like: [example.com](https://www.example.com/).`,
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
