"use server"

import { getBlitzContext } from "@/src/blitz-server"
import { gpt5Mini } from "@/src/models"
import { parseEmail } from "@/src/server/protocol-emails/parseEmail"
import { createFieldInstructions } from "@/src/server/protocol-emails/sharedProtocolPrompt"
import { createProtocolExtractionSchema } from "@/src/server/protocol-emails/sharedProtocolSchema"
import { generateObject, NoObjectGeneratedError } from "ai"
import db from "db"
import { Langfuse } from "langfuse"

// tbd blitz mutation or server function?

const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
})

export async function reprocessProtocol(protocolId: number) {
  // Authenticate request
  const { session } = await getBlitzContext()

  if (!session?.userId) {
    throw new Error("Authentication required")
  }

  console.log("Reprocessing protocol from user:", session.userId)

  // Fetch the protocol from DB
  const protocol = await db.protocol.findFirst({
    where: { id: protocolId },
    include: {
      uploads: {
        select: {
          id: true,
          title: true,
          summary: true,
        },
      },
    },
  })

  if (!protocol) {
    throw new Error("Protocol not found")
  }

  console.log(`Found protocol ${protocolId} for project ${protocol.projectId}`)

  // Check if user is admin or a project member with editor permissions
  const isAdmin = session.role === "ADMIN"

  if (!isAdmin) {
    const membership = await db.membership.findFirst({
      where: {
        userId: session.userId,
        projectId: protocol.projectId,
        role: "EDITOR",
      },
    })

    if (!membership) {
      throw new Error("You must be an admin or project editor to reprocess protocols")
    }
  }

  // Fetch the related protocol-email and parse it to extract body
  let protocolEmail = null
  let emailBody: string | null = null
  if (protocol.protocolEmailId) {
    protocolEmail = await db.protocolEmail.findUnique({
      where: { id: protocol.protocolEmailId },
    })
    console.log(`Found related protocol email ${protocol.protocolEmailId}`)

    // Parse the email to extract only the body (not the full MIME text)
    if (protocolEmail) {
      try {
        const parsed = await parseEmail(protocolEmail.text)
        emailBody = parsed.body
        console.log(`Extracted email body.`)
      } catch (error) {
        console.error("Error parsing email:", error)
        // If parsing fails, use the original text as body
        emailBody = protocolEmail.text
        console.log("Failed to parse email, using original text as body")
      }
    }
  } else {
    console.log("No related protocol email found")
  }

  // Get uploads from protocol
  const uploads = protocol.uploads

  console.log(`Found ${uploads.length} uploads related to protocol`)

  // Fetch project topics and subsections
  const subsections = await db.subsection.findMany({
    where: { projectId: protocol.projectId },
    select: {
      id: true,
      slug: true,
      start: true,
      end: true,
    },
    orderBy: { order: "asc" },
  })
  console.log(`Found ${subsections.length} subsections for project ${protocol.projectId}`)

  const protocolTopics = await db.protocolTopic.findMany({
    where: { projectId: protocol.projectId },
    select: {
      id: true,
      title: true,
    },
  })
  console.log(`Found ${protocolTopics.length} protocol topics for project ${protocol.projectId}`)

  // Call generateObject with shared schema and prompt
  const trace = langfuse.trace({
    name: "reprocess-protocol",
    userId: String(session?.userId) || "SYSTEM",
  })

  const finalExtractionSchema = createProtocolExtractionSchema(subsections, protocolTopics)
  const fieldInstructions = createFieldInstructions({
    subsections,
    protocolTopics,
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

  let finalResult
  try {
    const result = await generateObject({
      model: gpt5Mini,
      schema: finalExtractionSchema,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "reprocess-protocol-function",
        metadata: {
          langfuseTraceId: trace.id,
        },
      },
      system:
        "You are an AI assistant that can read protocol entries to refine and extract structured information.",
      prompt: `### PROTOCOL

**Current Protocol Body (IMPORTANT!):**
${protocol.body}

${emailBody ? `**Original Email Body (from which Current Protocol Body was generated):**\n${emailBody}\n` : ""}
${uploadsContext}

---

### CONTEXT
This protocol entry was previously generated from an email and needs to be reprocessed with refined information.

It is part of a professional discussion among administrative staff and stakeholders involved in an **infrastructural planning project**.
Your task is to extract and refine structured information for the protocol entry.

---

### TASK
Analyze the protocol body${emailBody ? " and original email body" : ""} and identify the following fields:

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
    throw new Error("Failed to reprocess protocol with AI")
  }

  // Console.log the result
  console.log("=== AI REPROCESSING RESULT ===")
  console.log(JSON.stringify(finalResult, null, 2))
  console.log("==============================")

  await langfuse.flushAsync()

  return {
    success: true,
    protocolId: protocol.id,
    aiSuggestions: {
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : new Date(),
      subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : undefined,
      protocolTopics: finalResult.protocolTopics?.map((id) => parseInt(id)) || [],
    },
    message: "Protocol reprocessed successfully",
  }
}
