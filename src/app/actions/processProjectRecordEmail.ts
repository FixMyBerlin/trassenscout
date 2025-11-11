"use server"

import { getBlitzContext } from "@/src/blitz-server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { extractWithAI } from "@/src/server/ProjectRecordEmails/processEmail/extractWithAI"
import { fetchProjectContext } from "@/src/server/ProjectRecordEmails/processEmail/fetchProjectContext"
import { langfuse } from "@/src/server/ProjectRecordEmails/processEmail/langfuseClient"
import { parseEmail } from "@/src/server/ProjectRecordEmails/processEmail/parseEmail"
import { uploadEmailAttachments } from "@/src/server/ProjectRecordEmails/processEmail/uploadEmailAttachments"
import db, { ProjectRecordReviewState, ProjectRecordType } from "db"

export const processProjectRecordEmail = async ({
  projectRecordEmailId,
}: {
  projectRecordEmailId: number
}) => {
  // Authenticate request
  const { session } = await getBlitzContext()

  if (!session?.userId) {
    throw new Error("Authentication required")
  }

  // Check if user is admin
  if (session.role !== "ADMIN") {
    // For now, require admin access
    throw new Error("You must be an admin to process projectRecord emails")
  }

  console.log("Processing projectRecord email from user:", session.userId)

  // Get the ProjectRecordEmail
  const projectRecordEmail = await db.projectRecordEmail.findFirst({
    where: { id: projectRecordEmailId },
  })
  if (!projectRecordEmail) {
    throw new Error("ProjectRecordEmail not found")
  }

  // Parse the email, separate body from attachments
  const { body: emailBody, attachments } = await parseEmail({
    rawEmailText: projectRecordEmail.text,
  })

  // Upload attachments to S3 and create Upload records
  const uploadIds = await uploadEmailAttachments({
    attachments,
    projectId: projectRecordEmail.projectId,
    projectRecordEmailId,
  })

  // Fetch subsections, subsubsections, and projectRecord topics for this project
  const projectContext = await fetchProjectContext({ projectId: projectRecordEmail.projectId })

  // AI extraction with authenticated user
  const finalResult = await extractWithAI({
    emailBody,
    projectContext,
    userId: String(session.userId),
  })

  const combinedResult = {
    ...finalResult,
    projectId: projectRecordEmail.projectId,
    subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : null,
    subsubsectionId: finalResult.subsubsectionId ? parseInt(finalResult.subsubsectionId) : null,
    projectRecordTopics:
      finalResult.topics && Array.isArray(finalResult.topics)
        ? finalResult.topics.map((id) => parseInt(id))
        : [],
  }

  // Create ProjectRecord with AI-extracted data
  // Always set reviewState to NEEDSREVIEW for client-initiated processing
  const projectRecord = await db.projectRecord.create({
    data: {
      title: combinedResult.title,
      body: combinedResult.body,
      // if date is null or invalid, use current date
      date: combinedResult.date ? new Date(combinedResult.date) || new Date() : new Date(),
      subsectionId: combinedResult.subsectionId,
      subsubsectionId: combinedResult.subsubsectionId,
      projectId: combinedResult.projectId,
      projectRecordAuthorType: ProjectRecordType.SYSTEM,
      projectRecordUpdatedByType: ProjectRecordType.SYSTEM,
      reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      projectRecordEmailId: projectRecordEmailId,
      reviewNotes: null,
      projectRecordTopics: {
        connect: combinedResult.projectRecordTopics.map((id) => ({ id })),
      },
      uploads: {
        connect: uploadIds.map((id) => ({ id })),
      },
    },
  })

  // Create log entry
  await createLogEntry({
    action: "CREATE",
    message: `Neues Projektprotokoll ${projectRecord.title} per KI aus Email mir ID ${projectRecordEmailId} erstellt`,
    userId: session.userId,
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
  })

  await langfuse.flushAsync()

  console.log(
    `Created projectRecord ${projectRecord.id} from projectRecordEmail ${projectRecordEmailId}`,
  )

  return {
    projectRecordId: projectRecord.id,
    uploadIds: uploadIds,
  }
}
