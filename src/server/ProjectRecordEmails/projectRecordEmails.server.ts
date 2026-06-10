import { z } from "zod"
import {
  ProjectRecordEditingState,
  ProjectRecordReviewState,
  ProjectRecordType,
} from "@/src/prisma/generated/client"
import { extractProjectRecordFromEmail } from "@/src/server/ai/extractProjectRecordFromEmail.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { flushLangfuseSpans } from "@/src/server/observability/langfuseSpanProcessor.server"
import {
  DeleteProjectRecordEmailSchema,
  ProjectRecordEmailSchema,
  UpdateProjectRecordEmailSchema,
} from "@/src/shared/projectRecordEmails/schemas"
import { checkProjectAiEnabled } from "./incoming/checkProjectAiEnabled.server"
import { isAdminOrProjectMember } from "./incoming/checkSenderApproval.server"
import { fetchProjectContext } from "./incoming/fetchProjectContext.server"
import { parseEmail } from "./incoming/parseEmail.server"
import { uploadEmailAttachments } from "./incoming/uploadEmailAttachments.server"
import { GetProjectRecordEmailsSchema } from "./projectRecordEmails.inputSchemas"

export const GetProjectRecordEmailSchema = z.object({ id: z.number() })
export const CreateProjectRecordEmailSchema = ProjectRecordEmailSchema

export type GetProjectRecordEmailsInput = z.infer<typeof GetProjectRecordEmailsSchema>

const projectRecordEmailInclude = {
  project: { select: { id: true, slug: true, subTitle: true, aiEnabled: true } },
  projectRecords: { select: { id: true, title: true } },
  uploads: { select: { id: true, title: true } },
} as const

export async function getProjectRecordEmails(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordEmailsSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.findMany({
    include: projectRecordEmailInclude,
    orderBy: { date: "desc" },
    where: input.projectId ? { projectId: input.projectId } : undefined,
  })
}

export async function getProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.findUniqueOrThrow({
    include: projectRecordEmailInclude,
    where: { id: input.id },
  })
}

export async function createProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.create({
    data: input,
    include: projectRecordEmailInclude,
  })
}

export async function updateProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)
  const { id, ...data } = input

  return db.projectRecordEmail.update({
    where: { id },
    data,
    include: projectRecordEmailInclude,
  })
}

export async function deleteProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.delete({
    where: { id: input.id },
    include: projectRecordEmailInclude,
  })
}

export const ProcessProjectRecordEmailSchema = z.object({
  projectRecordEmailId: z.number(),
})

export async function processProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof ProcessProjectRecordEmailSchema>,
) {
  const session = await endpointAuth.admin(headers)
  const { projectRecordEmailId } = input

  const initialProjectRecordEmail = await db.projectRecordEmail.findFirst({
    where: { id: projectRecordEmailId },
    include: { uploads: { select: { id: true } } },
  })

  if (!initialProjectRecordEmail?.projectId) {
    throw new Error("ProjectRecordEmail not found or has no associated project")
  }

  const project = await db.project.findUnique({
    where: { id: initialProjectRecordEmail.projectId },
  })
  if (!project) {
    throw new Error(`Project with ID '${initialProjectRecordEmail.projectId}' not found`)
  }

  const { body, attachments, from, subject, date } = await parseEmail({
    rawEmailText: initialProjectRecordEmail.text,
  })

  const projectId = project.id
  const projectSlug = project.slug
  const isAiEnabled = await checkProjectAiEnabled(project.id)
  const isSenderApproved = await isAdminOrProjectMember({ projectId, email: from })

  const projectRecordEmail = await db.projectRecordEmail.update({
    where: { id: projectRecordEmailId },
    data: { textBody: body, from, subject, date },
  })

  const { uploadIds, skippedAttachments } = await uploadEmailAttachments({
    attachments,
    projectId,
    projectSlug,
    projectRecordEmailId: projectRecordEmail.id,
  })

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

  const projectContext = await fetchProjectContext({ projectId })
  const finalResult = await extractProjectRecordFromEmail({
    body,
    subject,
    from,
    projectContext,
    userId: String(session.userId),
  })

  const projectRecord = await db.projectRecord.create({
    data: {
      editingState: ProjectRecordEditingState.PENDING,
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : date || new Date(),
      projectId,
      projectRecordAuthorType: ProjectRecordType.SYSTEM,
      reviewState:
        isSenderApproved && isAiEnabled
          ? ProjectRecordReviewState.NEEDSREVIEW
          : ProjectRecordReviewState.NEEDSADMINREVIEW,
      projectRecordEmailId: projectRecordEmail.id,
      reviewNotes: reviewNotes.join(" ") || null,
      projectRecordTopics: {
        connect: (finalResult.topics ?? []).map((id) => ({ id: Number(id) })),
      },
      uploads: { connect: uploadIds.map((id) => ({ id })) },
    },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Neuer Protokolleintrag aus Admin-Interface ${projectRecord.title} per KI aus E-Mail #${projectRecordEmailId} erstellt`,
    userId: Number(session.userId),
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
  })

  await flushLangfuseSpans()

  return {
    isAiEnabled,
    isSenderApproved,
    projectRecordId: projectRecord.id,
    uploadIds,
  }
}
