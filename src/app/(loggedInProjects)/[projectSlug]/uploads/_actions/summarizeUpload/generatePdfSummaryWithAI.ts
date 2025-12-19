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

Create a concise German summary that helps users decide if the document is relevant and understand its main content.

## Requirements

**Purpose**: Help users answer "Is this relevant for me?", "What is this about?", "Which relevant information does it contain?"

**Length**: Usually 150–300 words, hard maximum: 500 words. Only include essential content.

**Style**:
- Clear, factual and concise
- Descriptive
- Do **not** include details, lists, or technical depth here
- Focus on document purpose and project relevance
  ❌ Too detailed / reproducing:
  "Das Dokument enthält folgende Preise: …"
  ✅ Desired Abstraction:
  "Das Dokument enthält eine Preisübersicht für Bauleistungen, die als Grundlage für Kosteneinschätzungen im Projekt XYZ dient."

**Language**:
- German
- gender-neutral: preferring neutral participle forms (e.g., Bearbeitende) and otherwise using colon forms (e.g., Nutzer:innen, Autor:in)
- Reuse terminology exactly as it appears in the document. Do not normalize, translate, or paraphrase technical or administrative terms.

**Format**:
- Use headings if longer than 3 paragraphs
- Use Markdown formatting for better readability
- Do not use bold formatting in running text
- Convert links into Markdown link format: [example](https://www.example.de)
- When referring to pages, use the absolute page count (not printed page numbers)

**Unreadable content**:
- If the whole document is unreadable (images only, corrupted text, etc.): "Das Dokument enthält nicht auswertbaren Inhalt für eine KI-gestützte Zusammenfassung"
- If parts are unreadable: Note this in the summary, e.g., "Teile des Dokuments sind nicht lesbar, aber die verfügbaren Abschnitte behandeln..."

${projectContextSection}

## Explicitly Do **Not**
- Draw conclusions or assessments
- Infer intent, impact, or relevance beyond what is stated
- Combine information from different sections into new interpretations
- Add background knowledge not present in the document

  ❌ Assessments or conclusions:
  "Die Planung ist problematisch und unvollständig."
  ✅ Neutral descriptive:
  "Das Dokument beschreibt den aktuellen Stand der Planung und weist auf offene Punkte hin."
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
