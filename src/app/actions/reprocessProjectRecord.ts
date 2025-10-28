"use server"

import { getBlitzContext } from "@/src/blitz-server"
import { gpt5Mini } from "@/src/core/ai/models"
import { parseEmail } from "@/src/server/ProjectRecordEmails/parseEmail"
import { createFieldInstructions } from "@/src/server/ProjectRecordEmails/sharedProjectRecordPrompt"
import { createProjectRecordExtractionSchema } from "@/src/server/ProjectRecordEmails/sharedProjectRecordSchema"

import { generateObject, NoObjectGeneratedError } from "ai"
import db from "db"
import { Langfuse } from "langfuse"

// tbd blitz mutation or server function?

const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
})

export async function reprocessProjectRecord(projectRecordId: number) {
  // Authenticate request
  const { session } = await getBlitzContext()

  if (!session?.userId) {
    throw new Error("Authentication required")
  }

  console.log("Reprocessing projectRecord from user:", session.userId)

  // Fetch the projectRecord from DB
  const projectRecord = await db.projectRecord.findFirst({
    where: { id: projectRecordId },
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

  if (!projectRecord) {
    throw new Error("ProjectRecord not found")
  }

  console.log(`Found projectRecord ${projectRecordId} for project ${projectRecord.projectId}`)

  // Check if user is admin or a project member with editor permissions
  const isAdmin = session.role === "ADMIN"

  if (!isAdmin) {
    const membership = await db.membership.findFirst({
      where: {
        userId: session.userId,
        projectId: projectRecord.projectId,
        role: "EDITOR",
      },
    })

    if (!membership) {
      throw new Error("You must be an admin or project editor to reprocess projectRecords")
    }
  }

  // Fetch the related projectRecord-email and parse it to extract body
  let projectRecordEmail = null
  let emailBody: string | null = null
  if (projectRecord.projectRecordEmailId) {
    projectRecordEmail = await db.projectRecordEmail.findUnique({
      where: { id: projectRecord.projectRecordEmailId },
    })
    console.log(`Found related projectRecord email ${projectRecord.projectRecordEmailId}`)

    // Parse the email to extract only the body (not the full MIME text)
    if (projectRecordEmail) {
      try {
        const parsed = await parseEmail(projectRecordEmail.text)
        emailBody = parsed.body
        console.log(`Extracted email body.`)
      } catch (error) {
        console.error("Error parsing email:", error)
        // If parsing fails, use the original text as body
        emailBody = projectRecordEmail.text
        console.log("Failed to parse email, using original text as body")
      }
    }
  } else {
    console.log("No related projectRecord email found")
  }

  // Get uploads from projectRecord
  const uploads = projectRecord.uploads

  console.log(`Found ${uploads.length} uploads related to projectRecord`)

  // Fetch project topics and subsections
  const subsections = await db.subsection.findMany({
    where: { projectId: projectRecord.projectId },
    select: {
      id: true,
      slug: true,
      start: true,
      end: true,
    },
    orderBy: { order: "asc" },
  })
  console.log(`Found ${subsections.length} subsections for project ${projectRecord.projectId}`)

  const projectRecordTopics = await db.projectRecordTopic.findMany({
    where: { projectId: projectRecord.projectId },
    select: {
      id: true,
      title: true,
    },
  })
  console.log(
    `Found ${projectRecordTopics.length} projectRecord topics for project ${projectRecord.projectId}`,
  )

  // Call generateObject with shared schema and prompt
  const trace = langfuse.trace({
    name: "reprocess-protocol",
    userId: String(session?.userId),
  })

  const finalExtractionSchema = createProjectRecordExtractionSchema({
    subsections,
    projectRecordTopics,
  })
  const fieldInstructions = createFieldInstructions({
    subsections,
    projectRecordTopics,
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
        functionId: "protocol-function",
        metadata: {
          langfuseTraceId: trace.id,
        },
      },
      system: "You are an AI assistant that can refine project record entries.",
      prompt: `### PROJECT RECORD

**Current record entry (IMPORTANT!):**
${projectRecord.body}

${emailBody ? `**Original Email Body (from which the current record entry was generated):**\n${emailBody}\n` : ""}
${uploadsContext}

---

### CONTEXT
Your task is to extract structured information to refine a **project record entry** for a task manager application.

---

### TASK
Analyze the current record entry ${emailBody ? " and original email body" : ""} ${uploads.length > 0 ? " and related document summaries" : ""} and identify the following fields:

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
    throw new Error("Failed to reprocess projectRecord with AI")
  }

  // Console.log the result
  console.log("=== AI REPROCESSING RESULT ===")
  console.log(JSON.stringify(finalResult, null, 2))
  console.log("==============================")

  await langfuse.flushAsync()

  return {
    success: true,
    projectRecordId: projectRecord.id,
    aiSuggestions: {
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : new Date(),
      subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : undefined,
      projectRecordTopics: finalResult.topics?.map((id) => parseInt(id)) || [],
    },
    message: "ProjectRecord reprocessed successfully",
  }
}
