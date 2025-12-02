import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import db, { ProjectRecordReviewState, ProjectRecordType } from "db"

import { checkProjectAiEnabled } from "@/src/server/ProjectRecordEmails/processEmail/checkProjectAiEnabled"
import { isAdminOrProjectMember } from "@/src/server/ProjectRecordEmails/processEmail/checkSenderApproval"
import { extractWithAI } from "./extractWithAI"
import { fetchProjectContext } from "./fetchProjectContext"
import { langfuse } from "./langfuseClient"
import { notifyAdminsProjectRecordEmailWithoutProject } from "./notifyAdminsProjectRecordEmailWithoutProject"
import { notifyAdminsProjectRecordNeedsReview } from "./notifyAdminsProjectRecordNeedsReview"
import { parseEmail } from "./parseEmail"
import { uploadEmailAttachments } from "./uploadEmailAttachments"

export const processProjectRecordEmailOrchestrator = async ({
  projectSlug,
  rawEmailText,
}: {
  rawEmailText: string
  projectSlug?: string
}) => {
  // Check if project exists in database
  const project = await db.project.findUnique({
    where: { slug: projectSlug },
  })

  // Parse the email, separate body from attachments
  const { body, attachments, from, subject, date } = await parseEmail({
    rawEmailText,
  })

  // If project does not exist, create ProjectRecordEmail with project NULL and skip processing and uploading attachments
  if (!project) {
    const projectRecordEmail = await db.projectRecordEmail.create({
      data: {
        text: rawEmailText,
        textBody: body,
        from,
        subject,
        date,
        projectId: null,
      },
    })

    // Notify admins about email without project
    await notifyAdminsProjectRecordEmailWithoutProject({
      projectSlug,
      senderEmail: from || "Unbekannt",
      emailSubject: subject,
      projectRecordEmailId: projectRecordEmail.id,
    })

    return {
      success: false,
      projectRecordEmailId: projectRecordEmail.id,
      message: !projectSlug
        ? `No Project Slug provided. Email stored but not processed.`
        : `Project with slug '${projectSlug}' not found. Email stored but not processed.`,
    }
  }

  // Project exists, continue with normal flow
  const projectId = project.id

  // Check if AI features are enabled for the project
  const isAiEnabled = await checkProjectAiEnabled(projectId)

  // Check if sender is approved (project team member or admin)
  const isSenderApproved = await isAdminOrProjectMember({
    projectId,
    email: from,
  })

  // Store email in DB
  const projectRecordEmail = await db.projectRecordEmail.create({
    data: {
      text: rawEmailText,
      projectId,
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
    projectSlug: project.slug,
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

  // AI extraction
  const finalResult = await extractWithAI({
    body,
    subject: subject,
    from: from,
    projectContext,
    userId: "SYSTEM",
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
    message: `Neues Projektprotokoll ${projectRecord.title} per KI aus Email mir ID ${projectRecordEmail.id} erstellt`,
    // tbd maybe we need an AI/SYSTEM user type here
    userId: null,
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
  })

  // Notify editors if sender is not approved or AI is disabled
  if (!isSenderApproved || !isAiEnabled) {
    await notifyAdminsProjectRecordNeedsReview({
      projectId,
      projectSlug: project.slug,
      senderEmail: from || "Unbekannt",
      emailSubject: subject,
      projectRecordId: projectRecord.id,
      isAiEnabled,
      isSenderApproved,
    })
  }

  await langfuse.flushAsync()

  return {
    success: true,
    projectRecordId: projectRecord.id,
    uploadIds: uploadIds,
    message: `ProjectRecord created successfully with ${uploadIds.length} attachment(s)`,
  }
}
