"use server"

import { authorizeAdmin } from "@/src/app/(admin)/_utils/authorizeAdmin"
import { checkProjectAiEnabled } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/checkProjectAiEnabled"
import { isAdminOrProjectMember } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/checkSenderApproval"
import { extractWithAI } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/extractWithAI"
import { fetchProjectContext } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/fetchProjectContext"
import { langfuse } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/langfuseClient"
import { parseEmail } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/parseEmail"
import { uploadEmailAttachments } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/uploadEmailAttachments"
import { getBlitzContext } from "@/src/blitz-server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import db, { ProjectRecordReviewState, ProjectRecordType } from "db"

/**
 * NOTE: All parts related to subsections and subsubsections are temporarily commented out
 * as we are not yet sure how the customer uses this feature.
 */
export const processProjectRecordEmail = async ({
  projectRecordEmailId,
}: {
  projectRecordEmailId: number
}) => {
  await authorizeAdmin()
  const { session } = await getBlitzContext()
  console.log("Processing projectRecord email from user:", session.userId)

  // Get the ProjectRecordEmail with project slug
  const initialProjectRecordEmail = await db.projectRecordEmail.findFirst({
    where: { id: projectRecordEmailId },
    include: { uploads: { select: { id: true } } },
  })

  if (!initialProjectRecordEmail) {
    throw new Error("ProjectRecordEmail not found")
  }

  // If the email has no associated project, cannot process
  if (!initialProjectRecordEmail.projectId) {
    throw new Error(
      "ProjectRecordEmail has no associated project. Cannot process email without project context.",
    )
  }

  // Get the project
  const project = await db.project.findUnique({
    where: { id: initialProjectRecordEmail.projectId },
  })
  if (!project) {
    throw new Error(
      `Project with ID '${initialProjectRecordEmail.projectId}' not found. Cannot process email.`,
    )
  }

  // Parse the email, separate body from attachments
  const { body, attachments, from, subject, date } = await parseEmail({
    rawEmailText: initialProjectRecordEmail.text,
  })

  // Project exists, continue with normal flow
  const projectId = project.id
  const projectSlug = project.slug
  // Check if AI enabled for the project
  const isAiEnabled = await checkProjectAiEnabled(project.id)

  // Check if sender is approved (project team member or admin)
  const isSenderApproved = await isAdminOrProjectMember({
    projectId,
    email: from,
  })

  // Update email in DB
  const projectRecordEmail = await db.projectRecordEmail.update({
    where: { id: projectRecordEmailId },
    data: {
      textBody: body,
      from,
      subject,
      date,
    },
  })

  // Upload attachments to S3 and create Upload records
  const { uploadIds, skippedAttachments } = await uploadEmailAttachments({
    attachments,
    projectId,
    projectSlug,
    projectRecordEmailId: projectRecordEmail.id,
  })

  // Prepare review note for unapproved senders or disabled AI
  const reviewNotes: string[] = []

  if (!isSenderApproved) {
    reviewNotes.push(
      `Email von unbekannter Absenderadresse erhalten: ${from || "Unbekannt"}. Bitte prüfen Sie, ob dieser Absender berechtigt ist, Projektprotokolle für Projekt ${projectSlug} einzureichen.`,
    )
  }

  if (!isAiEnabled) {
    reviewNotes.push(
      "AI-Funktionen sind für dieses Projekt deaktiviert. Manuelle Überprüfung erforderlich.",
    )
  }

  if (skippedAttachments.length > 0) {
    const skippedFilesList = skippedAttachments
      .map((att) => `"${att.filename}" (${att.reason})`)
      .join(", ")
    reviewNotes.push(
      `${skippedAttachments.length} Anhang/Anhänge wurden nicht hochgeladen: ${skippedFilesList}`,
    )
  }
  const reviewNote = reviewNotes.join(" ")

  // Fetch subsections, subsubsections, and projectRecord topics for this project
  const projectContext = await fetchProjectContext({ projectId })

  // AI extraction with authenticated user
  const finalResult = await extractWithAI({
    body,
    subject,
    from,
    projectContext,
    userId: String(session.userId),
  })

  const combinedResult = {
    ...finalResult,
    projectId,
    // subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : null,
    // subsubsectionId: finalResult.subsubsectionId ? parseInt(finalResult.subsubsectionId) : null,
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
      // if date is null or invalid, use parsed date or current date
      date: combinedResult.date ? new Date(combinedResult.date) : date || new Date(),
      // subsectionId: combinedResult.subsectionId,
      // subsubsectionId: combinedResult.subsubsectionId,
      projectId: combinedResult.projectId,
      projectRecordAuthorType: ProjectRecordType.SYSTEM,

      reviewState:
        isSenderApproved && isAiEnabled
          ? ProjectRecordReviewState.NEEDSREVIEW
          : ProjectRecordReviewState.NEEDSADMINREVIEW,
      projectRecordEmailId: projectRecordEmail.id,
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
    message: `Neues Projektprotokoll aus Admin-Interface ${projectRecord.title} per KI aus E-Mail #${projectRecordEmailId} erstellt`,
    userId: session.userId,
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
  })

  await langfuse.flushAsync()

  console.log(
    `Created projectRecord ${projectRecord.id} from projectRecordEmail ${projectRecordEmailId}`,
  )

  return {
    isAiEnabled,
    isSenderApproved,
    projectRecordId: projectRecord.id,
    uploadIds,
  }
}
