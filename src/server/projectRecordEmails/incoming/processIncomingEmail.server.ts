import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/browser"
import { extractProjectRecordFromEmail } from "@/src/server/ai/extractProjectRecordFromEmail.server"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { flushLangfuseSpans } from "@/src/server/observability/langfuseSpanProcessor.server"
import { checkProjectAiEnabled } from "./checkProjectAiEnabled.server"
import { isAdminOrProjectMember } from "./checkSenderApproval.server"
import { fetchProjectContext } from "./fetchProjectContext.server"
import { notifyAdminsProjectRecordEmailWithoutProject } from "./notifyAdminsProjectRecordEmailWithoutProject.server"
import { notifyAdminsProjectRecordNeedsReview } from "./notifyAdminsProjectRecordNeedsReview.server"
import { notifySenderLegacyProtocolMailboxMoved } from "./notifySenderLegacyProtocolMailboxMoved.server"
import { parseEmail } from "./parseEmail.server"
import { uploadEmailAttachments } from "./uploadEmailAttachments.server"

export async function processIncomingProjectRecordEmail({
  projectSlug,
  rawEmailText,
}: {
  rawEmailText: string
  projectSlug?: string
}) {
  try {
    const project = projectSlug
      ? await db.project.findUnique({
          where: { slug: projectSlug },
        })
      : null

    const { body, attachments, from, fromAddress, to, cc, subject, date } = await parseEmail({
      rawEmailText,
    })

    await notifySenderLegacyProtocolMailboxMoved({
      senderEmail: fromAddress,
      to,
      cc,
    })

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
          ? "No Project Slug provided. Email stored but not processed."
          : `Project with slug '${projectSlug}' not found. Email stored but not processed.`,
      }
    }

    const projectId = project.id
    const isAiEnabled = await checkProjectAiEnabled(projectId)
    const isSenderApproved = await isAdminOrProjectMember({
      projectId,
      email: from,
    })

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

    const { uploadIds, skippedAttachments } = await uploadEmailAttachments({
      attachments,
      projectId,
      projectSlug: project.slug,
      projectRecordEmailId: projectRecordEmail.id,
    })

    if (!body?.trim() && uploadIds.length === 0) {
      return {
        success: false,
        projectRecordEmailId: projectRecordEmail.id,
        message: "Email body is empty and no attachments. No ProjectRecord created.",
      }
    }

    const reviewNotes: string[] = []

    if (!isSenderApproved) {
      reviewNotes.push(
        `Email von unbekannter Absenderadresse erhalten: ${from || "Unbekannt"}. Bitte prüfen Sie, ob dieser Absender berechtigt ist, Protokolleinträge für Projekt ${projectSlug} einzureichen.`,
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

    const projectContext = await fetchProjectContext({ projectId })

    const finalResult = await extractProjectRecordFromEmail({
      body,
      subject,
      from,
      projectContext,
      userId: "SYSTEM",
    })

    const combinedResult = {
      ...finalResult,
      projectId,
      projectRecordTopics:
        finalResult.topics && Array.isArray(finalResult.topics)
          ? finalResult.topics.map((id) => parseInt(id, 10))
          : [],
    }

    const projectRecord = await db.projectRecord.create({
      data: {
        editingState: ProjectRecordEditingState.PENDING,
        title: combinedResult.title,
        body: combinedResult.body,
        date: combinedResult.date ? new Date(combinedResult.date) : date || new Date(),
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

    await createLogEntry({
      action: "CREATE",
      message: `Neuer Protokolleintrag ${projectRecord.title} per KI aus Email mir ID ${projectRecordEmail.id} erstellt`,
      userId: null,
      projectId: projectRecord.projectId,
      projectRecordId: projectRecord.id,
    })

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

    return {
      success: true,
      projectRecordId: projectRecord.id,
      uploadIds,
      message: `ProjectRecord created successfully with ${uploadIds.length} attachment(s)`,
    }
  } finally {
    await flushLangfuseSpans()
  }
}
