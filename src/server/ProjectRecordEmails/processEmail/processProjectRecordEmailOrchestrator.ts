import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import db, { ProjectRecordReviewState, ProjectRecordType } from "db"
import { extractWithAI } from "./extractWithAI"
import { fetchProjectContext } from "./fetchProjectContext"
import { langfuse } from "./langfuseClient"
import { parseEmail } from "./parseEmail"
import { uploadEmailAttachments } from "./uploadEmailAttachments"

export const processProjectRecordEmailOrchestrator = async ({
  projectRecordEmailId,
}: {
  projectRecordEmailId: number
}) => {
  // todo
  // In the future the email and the project will be part of the request
  // todo: projectRecordEmail db entry will be created here with relation to project
  // todo: check if sender address is allowed to submit emails (part of project team)
  // if not, create the ProjectRecordEmail but set NEEDSADMINREVIEW and add review note
  // send email to admins that email was received from unapproved sender and needs review
  const isSenderApproved = true

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

  let reviewNote = ""

  // Fetch subsections, subsubsections, and projectRecord topics for this project
  const projectContext = await fetchProjectContext({ projectId: projectRecordEmail.projectId })

  // AI extraction
  const finalResult = await extractWithAI({
    emailBody,
    projectContext,
    userId: "SYSTEM",
  })

  const combinedResult = {
    ...finalResult,
    // tbd
    projectId: projectRecordEmail.projectId,
    subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : null,
    subsubsectionId: finalResult.subsubsectionId ? parseInt(finalResult.subsubsectionId) : null,
    projectRecordTopics:
      finalResult.topics && Array.isArray(finalResult.topics)
        ? finalResult.topics.map((id) => parseInt(id))
        : [],
  }

  // Create ProjectRecord with AI-extracted data
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
      reviewState: isSenderApproved
        ? ProjectRecordReviewState.NEEDSREVIEW
        : ProjectRecordReviewState.NEEDSADMINREVIEW,
      projectRecordEmailId: projectRecordEmailId,
      reviewNotes: reviewNote || null,
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
    // tbd maybe we need an AI/SYSTEM user type here
    userId: null,
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
  })

  await langfuse.flushAsync()

  return {
    success: true,
    projectRecordId: projectRecord.id,
    uploadIds: uploadIds,
    message: `ProjectRecord created successfully with ${uploadIds.length} attachment(s)`,
  }
}
