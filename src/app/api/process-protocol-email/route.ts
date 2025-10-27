import { getBlitzContext } from "@/src/blitz-server"
import { gpt5Mini } from "@/src/models"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { parseEmail } from "@/src/server/protocol-emails/parseEmail"
import { createFieldInstructions } from "@/src/server/protocol-emails/sharedProtocolPrompt"
import { createProtocolExtractionSchema } from "@/src/server/protocol-emails/sharedProtocolSchema"
import { uploadEmailAttachment } from "@/src/server/protocol-emails/uploadEmailAttachment"
import { generateObject, NoObjectGeneratedError } from "ai"
import db, { ProtocolReviewState, ProtocolType } from "db"
import { Langfuse } from "langfuse"
import { z } from "zod"

const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
})

const ProcessProtocolEmailSchema = z.object({
  protocolEmailId: z.number(),
})

export async function POST(request: Request) {
  try {
    // Security: Check authentication - prioritize session over API key
    const { session } = await getBlitzContext()
    const apiKey = request.headers.get("process-email-api-key")

    // First, check if this is an authenticated admin user
    if (session?.userId) {
      if (session.role !== "ADMIN") {
        return Response.json({ error: "Admin access required" }, { status: 403 })
      }
      console.log("Processing email from admin user:", session.userId)
    }
    // If no session, check for valid system API key
    else if (apiKey) {
      if (apiKey !== process.env.INTERNAL_API_SECRET) {
        return Response.json({ error: "Invalid API key" }, { status: 401 })
      }
      console.log("Processing email from system service")
    }
    // No session and no API key
    else {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { protocolEmailId } = ProcessProtocolEmailSchema.parse(body)

    // todo
    // In the future the email and the project will be part of the request
    // todo: protocolEmail db entry will be created here with relation to project
    // todo: check if sender address is allowed to submit emails (part of project team)
    // if not, create the ProtocolEmail but set NEEDSADMINREVIEW and add review note
    // send email to admins that email was received from unapproved sender and needs review
    const isSenderApproved = true

    // Get the ProtocolEmail
    const protocolEmail = await db.protocolEmail.findFirst({
      where: { id: protocolEmailId },
    })
    if (!protocolEmail) {
      return Response.json({ error: "ProtocolEmail not found" }, { status: 404 })
    }

    // Parse the raw MIME email to separate body from attachments
    console.log("Parsing email to extract body and attachments...")
    let emailBody: string
    let attachments: Array<{
      filename: string
      contentType: string
      size: number
      content: Buffer
    }> = []

    try {
      const parsed = await parseEmail(protocolEmail.text)
      emailBody = parsed.body
      attachments = parsed.attachments
      console.log(
        `Extracted email body (${emailBody.length} chars) and ${attachments.length} attachments`,
      )
    } catch (error) {
      console.error("Error parsing email:", error)
      // If parsing fails, use the original text as body
      emailBody = protocolEmail.text
      console.log("Failed to parse email, using original text as body")
    }

    // (if upload is commented out for testing) just log attachment information
    // if (attachments.length > 0) {
    //   console.log("=== ATTACHMENTS FOUND ===")
    //   attachments.forEach((attachment, index) => {
    //     console.log(`Attachment ${index + 1}:`)
    //     console.log(`  - Filename: ${attachment.filename}`)
    //     console.log(`  - Content-Type: ${attachment.contentType}`)
    //     console.log(`  - Size: ${attachment.size} bytes`)
    //     console.log(`  - Content preview: ${attachment.content.slice(0, 50).toString("base64")}...`)
    //   })
    //   console.log("=========================")
    // } else {
    //   console.log("No attachments found in email")
    // }

    // Upload attachments to S3 and create Upload records (DISABLED FOR TESTING)
    const uploadPromises = attachments.map(async (attachment) => {
      console.log(`Uploading attachment: ${attachment.filename} (${attachment.size} bytes)`)

      try {
        // Upload to S3
        const uploadedFile = await uploadEmailAttachment(attachment, protocolEmail.projectId)

        // Create Upload record in database
        const upload = await db.upload.create({
          data: {
            title: attachment.filename,
            externalUrl: uploadedFile.url,
            projectId: protocolEmail.projectId,
            protocolEmailId: protocolEmailId,
            // tbd: summary
          },
        })

        console.log(`Created Upload record ${upload.id} for ${attachment.filename}`)
        return upload
      } catch (error) {
        console.error(`Error uploading attachment ${attachment.filename}:`, error)
        // Continue processing other attachments even if one fails
        return null
      }
    })

    const uploadResults = await Promise.all(uploadPromises)
    const createdUploads = uploadResults.filter((u) => u !== null)
    console.log(`Successfully processed ${createdUploads.length}/${attachments.length} attachments`)

    // Get the IDs of created uploads to connect to the protocol
    const uploadIds = createdUploads.map((upload) => upload!.id)

    // tbd
    // sessions: atm we do not need sessions; might be useful if we have a chat-like iterative ai process
    // see langfuse docs: https://langfuse.com/docs/observability/features/sessions
    // const trace = langfuse.trace({ sessionId: "some-session-id", name: "process-protocol-email" })
    const trace = langfuse.trace({
      name: "process-protocol-email",
      userId: String(session?.userId) || "SYSTEM",
    })

    let subsections: Array<{ id: number; slug: string; start: string; end: string }> = []
    let protocolTopics: Array<{ id: number; title: string }> = []
    let reviewNote = ""

    // Fetch subsections for this project
    subsections = await db.subsection.findMany({
      where: { projectId: protocolEmail.projectId },
      select: {
        id: true,
        slug: true,
        start: true,
        end: true,
      },
      orderBy: { order: "asc" },
    })
    console.log(`Found ${subsections.length} subsections for project ${protocolEmail.projectId}`)

    // Fetch protocol topics for this project
    protocolTopics = await db.protocolTopic.findMany({
      where: { projectId: protocolEmail.projectId },
      select: {
        id: true,
        title: true,
      },
    })
    console.log(
      `Found ${protocolTopics.length} protocol topics for project ${protocolEmail.projectId}`,
    )

    // Stage 2: AI call
    const finalExtractionSchema = createProtocolExtractionSchema({subsections, protocolTopics})
    const fieldInstructions = createFieldInstructions({
      subsections,
      protocolTopics,
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
      return Response.json({ error: "Failed to process email with AI" }, { status: 500 })
    }

    console.log("AI extraction result:", JSON.stringify(finalResult, null, 2))

    const combinedResult = {
      ...finalResult,
      // tbd
      projectId: protocolEmail.projectId,
      subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : null,
      protocolTopics:
        finalResult.topics && Array.isArray(finalResult.topics)
          ? finalResult.topics.map((id) => parseInt(id))
          : [],
    }

    // Create a DB entry Protocol with AI-extracted data
    const protocol = await db.protocol.create({
      data: {
        title: combinedResult.title,
        body: combinedResult.body,
        // if date is null or invalid, use current date
        date: combinedResult.date ? new Date(combinedResult.date) || new Date() : new Date(),
        subsectionId: combinedResult.subsectionId,
        projectId: combinedResult.projectId,
        protocolAuthorType: ProtocolType.SYSTEM,
        protocolUpdatedByType: ProtocolType.SYSTEM,
        reviewState: isSenderApproved
          ? ProtocolReviewState.NEEDSREVIEW
          : ProtocolReviewState.NEEDSADMINREVIEW,
        protocolEmailId: protocolEmailId,
        reviewNotes: reviewNote || null,
        protocolTopics: {
          connect: combinedResult.protocolTopics.map((id) => ({ id })),
        },
        uploads: {
          connect: uploadIds.map((id) => ({ id })),
        },
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Neues Projektprotokoll ${protocol.title} per KI aus Email mir ID ${protocolEmail.id} erstellt`,
      // tbd maybe we need an AI/SYSTEM user type here
      userId: null,
      projectId: protocol.projectId,
      protocolId: protocol.id,
    })

    console.log("Created Protocol:", protocol)

    // in ai stream functions: onFinish
    await langfuse.flushAsync()

    return Response.json({
      success: true,
      protocolId: protocol.id,
      uploadIds: uploadIds,
      message: `Protocol created successfully with ${createdUploads.length} attachment(s)`,
    })
  } catch (error) {
    console.error("Error processing protocol email:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
