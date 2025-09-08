import { getBlitzContext } from "@/src/blitz-server"
import { model } from "@/src/models"
import { generateObject, NoObjectGeneratedError } from "ai"
import db from "db"
import { z } from "zod"

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

    // Get the ProtocolEmail
    const protocolEmail = await db.protocolEmail.findFirst({
      where: { id: protocolEmailId },
    })

    if (!protocolEmail) {
      return Response.json({ error: "ProtocolEmail not found" }, { status: 404 })
    }

    // Get all projects
    const projects = await db.project.findMany({
      select: {
        id: true,
        slug: true,
        subTitle: true,
      },
    })

    // Stage 1: Process email with AI to identify project
    let firstStageResult
    try {
      const result = await generateObject({
        model: model,
        output: "enum",
        enum: [...projects.map((p) => p.id.toString()), "no project"],
        system:
          "You are an AI assistant that can read and process emails and gather information to identify the related project for a protocol entry.",
        prompt: `EMAIL: ${protocolEmail.text}

This is an MIME type email text. The email was forwarded to a system email address ts@ki.ts - which collects the emails which should be processed. The original email might have been sent from different email providers and servers.

The original / main email is part of a conversation of administration staff and related stakeholders in the context of an infrastructural planning project. Your task is to get necessary information from the raw email text to create a project protocol entry in our task manager app.

Please identify the project the email is related to. These are the projects in the format ID (SHORTTITLE - SUBTITLE): ${projects.map((p) => `${p.id} (${p.slug.toUpperCase()} - ${p.subTitle})`).join(", ")}. The short titles of projects are often acronyms of the terms "Radschnellweg" (RS) or "Radschnellverbindung" (RSV) in combination with a number like: "RSV 1" or "RS21" or the combination of municipality acronyms with a number like: "FRM 1". If you can not find a relation to one of the projects, DO NOT GUESS BUT USE "no project" as value.`,
      })
      firstStageResult = result.object
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.log("NoObjectGeneratedError in stage 1")
        console.log("Cause:", error.cause)
        console.log("Text:", error.text)
        console.log("Response:", error.response)
        console.log("Usage:", error.usage)
      }
      console.error("Error in AI processing (stage 1):", error)
      return Response.json({ error: "Failed to process email with AI" }, { status: 500 })
    }

    console.log("Stage 1 AI extraction result:", JSON.stringify(firstStageResult, null, 2))

    // 8. Stage 2: Determine project and fetch subsections if applicable
    let finalProjectId: string
    let subsections: Array<{ id: number; slug: string; start: string; end: string }> = []
    let reviewNote = ""

    if (!firstStageResult || firstStageResult === "no project") {
      // No matching project found, use first project and add review note
      if (!projects[0]) {
        return Response.json({ error: "No projects available in database" }, { status: 500 })
      }
      finalProjectId = String(projects[0].id)
      reviewNote =
        "No matching project was found by the AI. Using first available project as fallback."
      console.log("No project match found, using fallback project:", finalProjectId)
    } else {
      finalProjectId = String(firstStageResult)
      // Fetch subsections for this project
      subsections = await db.subsection.findMany({
        where: { projectId: Number(finalProjectId) },
        select: {
          id: true,
          slug: true,
          start: true,
          end: true,
        },
        orderBy: { order: "asc" },
      })
      console.log(`Found ${subsections.length} subsections for project ${finalProjectId}`)
    }

    // Stage 2: Final AI call with subsection information
    const finalExtractionSchema = z.object({
      body: z.string().min(1).describe("The main content/body of the email"),
      title: z.string().min(1).describe("A meaningful title for the protocol entry"),
      date: z.string().describe("The relevant date from the email (ISO format)"),
      subsectionId:
        subsections.length > 0
          ? z
              .enum(subsections.map((s) => s.id.toString()) as [string, ...string[]])
              .nullish()
              .describe(
                `The subsection / 'Abschnitt' ID this email relates to, if applicable. Available subsections: ${subsections.map((s) => `${s.id} (${s.slug} - ${s.start} bis ${s.end})`).join(", ")}. Or null if no specific subsection relation is found.`,
              )
          : z.null().describe("No subsections available for this project"),
    })

    let finalResult
    try {
      const result = await generateObject({
        model: model,
        schema: finalExtractionSchema,
        system:
          "You are an AI assistant that can read and process Emails and gather information to create a protocol entry.",
        prompt: `EMAIL: ${protocolEmail.text}

    Identify the following fields:

        - BODY: The body of the email. In html the body is wrapped by <body> tags. Format the body in markdown - e.g. **bold text** for important sections and highlight ## headings. Format links as inline links in markdown format: [loremipsum.de](https://www.loremipsum.de/). Do not delete any parts of the body, even if they seem unimportant.
        - DATE: The relevant date for the protocol entry. If nothing else is found, find the date the original email was sent.
        - TITLE: Generate a meaningful title.
        - SUBSECTIONID: ${
          subsections.length > 0
            ? `The subsection / 'Abschnitt' ID this email relates to. Based on the project context, please identify if this email relates to a specific subsection / 'Abschnitt' / 'Planungsabschnitt' / 'Bauabschnitt':
    Available subsections for this project: ${subsections.map((s) => `${s.id} (${s.slug.toUpperCase()} - ${s.start}(Start) bis ${s.end}(Ende)`).join(", ")}

    Look for references to specific route sections, kilometer markers, street names, or geographic locations that might match the subsection start/end points or slugs.`
            : "No subsections available for this project so set it to null."
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
      projectId: finalProjectId.toString(),
      subsectionId:
        finalResult.subsectionId && finalResult.subsectionId !== "no project"
          ? parseInt(finalResult.subsectionId)
          : null,
    }

    // Create a DB entry Protocol with AI-extracted data
    const protocol = await db.protocol.create({
      data: {
        title: combinedResult.title,
        body: combinedResult.body,
        date: new Date(combinedResult.date),
        subsectionId: combinedResult.subsectionId,
        projectId: Number(combinedResult.projectId),
        protocolAuthorType: "SYSTEM",
        protocolUpdatedByType: "SYSTEM",
        reviewState: "NEEDSREVIEW", // protocols created by SYSTEM need review
        protocolEmailId: protocolEmailId,
        reviewNotes: reviewNote || null,
      },
    })

    console.log("Created Protocol:", protocol)

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
