import { getBlitzContext } from "@/src/blitz-server"
import { gpt5Mini } from "@/src/models"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { generateObject, NoObjectGeneratedError } from "ai"
import db from "db"
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

    // todo attachements: create documents in db and create relations to email and protocol

    //  tbd
    const trace = langfuse.trace({ sessionId: "some-session-id", name: "process-protocol-email" })

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
    const finalExtractionSchema = z.object({
      body: z.string().min(1).describe("The main content/body of the email"),
      title: z.string().min(1).describe("A meaningful title for the protocol entry"),
      date: z.string().describe("The relevant date from the email (ISO format)"),
      subsectionId:
        subsections.length > 0
          ? z
              .enum(subsections.map((s) => s.id.toString()) as [string, ...string[]])
              .nullable()
              .describe(
                `The subsection / 'Abschnitt' ID this email relates to, if applicable. Available subsections: ${subsections.map((s) => `${s.id} (${s.slug} - ${s.start} bis ${s.end})`).join(", ")}. Or null if no specific subsection relation is found.`,
              )
          : z.null().describe("No subsections available for this project"),
      protocolTopics: z
        .array(
          protocolTopics.length > 0
            ? z.enum(protocolTopics.map((t) => t.id.toString()) as [string, ...string[]])
            : z.string(),
        )
        .describe(
          protocolTopics.length > 0
            ? `Array of protocol topic IDs that this email relates to. Available topics: ${protocolTopics.map((t) => `${t.id} (${t.title})`).join(", ")}. Select all relevant topics based on the email content.`
            : "No protocol topics available for this project, return an empty array.",
        ),
    })

    let finalResult
    try {
      const result = await generateObject({
        model: gpt5Mini,
        schema: finalExtractionSchema,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "process-protocol-email-stage-2",
          metadata: {
            langfuseTraceId: trace.id,
          },
        },
        system:
          "You are an AI assistant that can read and process Emails and gather information to create a protocol entry.",
        prompt: `EMAIL: ${protocolEmail.text}

This is an MIME type email text. The email was forwarded to a system email address ts@ki.ts - which collects the emails which should be processed. The original email might have been sent from different email providers and servers.

The original / main email is part of a conversation of administration staff and related stakeholders in the context of an infrastructural planning project. Your task is to get necessary information from the raw email text to create a project protocol entry in a task manager app.

Attachements: All attachements are Base64-encoded. Ignore images. If there are PDF attachements, extract ONLY text from them if they contain relevant information.

    Identify the following fields:

        - BODY: Here we need the actual text body of the email ONLY - and only once. In html the body is wrapped by <body> tags. Format the body in markdown - e.g. **bold text** for important sections and highlight ## headings. Format links as inline links in markdown format: [loremipsum.de](https://www.loremipsum.de/). Do not delete any parts of the body, even if they seem unimportant.
        - DATE: The relevant date for the protocol entry. If nothing else is found, find the date the original email was sent.
        - TITLE: Generate a meaningful title.
        - SUBSECTIONID: ${
          subsections.length > 0
            ? `The subsection / 'Abschnitt' ID this email relates to. Based on the project context, please identify if this email relates to a specific subsection / 'Abschnitt' / 'Planungsabschnitt' / 'Bauabschnitt':
    Available subsections for this project: ${subsections.map((s) => `${s.id} (${s.slug.toUpperCase()} - ${s.start}(Start) bis ${s.end}(Ende)`).join(", ")}

    Look for references to specific route sections, kilometer markers, street names, or geographic locations that might match the subsection start/end points or slugs.`
            : "No subsections available for this project so set it to null."
        }
        - PROTOCOLTOPICS: ${
          protocolTopics.length > 0
            ? `A list of protocol topic IDs / 'Tags' that this email relates to. Based on the email content, identify which topics are relevant:
    Available protocol topics for this project: ${protocolTopics.map((t) => `${t.id} (${t.title})`).join(", ")}

    Look for keywords, themes, or subjects mentioned in the email that match these topic titles. Select all relevant topics - an email can relate to multiple topics. If no topics are clearly relevant, return an empty array.`
            : "No protocol topics available for this project, return an empty array."
        }
    `,
      })
      finalResult = result.object
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.log("NoObjectGeneratedError in stage 2")
        console.log("Cause:", error.cause)
        console.log("Text:", error.text)
        console.log("Response:", error.response)
        console.log("Usage:", error.usage)
      }
      console.error("Error in AI processing (stage 2):", error)
      return Response.json({ error: "Failed to process email with AI (stage 2)" }, { status: 500 })
    }

    console.log("Stage 2 AI extraction result:", JSON.stringify(finalResult, null, 2))

    const combinedResult = {
      ...finalResult,
      // tbd
      projectId: protocolEmail.projectId,
      subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : null,
      protocolTopics:
        finalResult.protocolTopics && Array.isArray(finalResult.protocolTopics)
          ? finalResult.protocolTopics.map((id) => parseInt(id))
          : [],
    }

    // Create a DB entry Protocol with AI-extracted data
    const protocol = await db.protocol.create({
      data: {
        title: combinedResult.title,
        body: combinedResult.body,
        date: new Date(combinedResult.date),
        subsectionId: combinedResult.subsectionId,
        projectId: combinedResult.projectId,
        protocolAuthorType: "SYSTEM",
        protocolUpdatedByType: "SYSTEM",
        reviewState: isSenderApproved ? "NEEDSREVIEW" : "NEEDSADMINREVIEW",
        protocolEmailId: protocolEmailId,
        reviewNotes: reviewNote || null,
        protocolTopics: {
          connect: combinedResult.protocolTopics.map((id) => ({ id })),
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
      message: "Protocol created successfully",
    })
  } catch (error) {
    console.error("Error processing protocol email:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
