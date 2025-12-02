"use server"

import { getBlitzContext } from "@/src/blitz-server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { checkProjectAiEnabled } from "@/src/server/ProjectRecordEmails/processEmail/checkProjectAiEnabled"
import { isAdminOrProjectMember } from "@/src/server/ProjectRecordEmails/processEmail/checkSenderApproval"
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
  const uploadIds = await uploadEmailAttachments({
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
      // if date is null or invalid, use parsed date or current date
      date: combinedResult.date ? new Date(combinedResult.date) : date || new Date(),
      subsectionId: combinedResult.subsectionId,
      subsubsectionId: combinedResult.subsubsectionId,
      projectId: combinedResult.projectId,
      projectRecordAuthorType: ProjectRecordType.SYSTEM,
      projectRecordUpdatedByType: ProjectRecordType.SYSTEM,
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
