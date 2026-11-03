import { z } from "zod"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { extractProjectRecordFromEmail } from "@/src/server/ai/extractProjectRecordFromEmail.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { flushLangfuseSpans } from "@/src/server/observability/langfuseSpanProcessor.server"
import { createProjectRecord } from "@/src/server/projectRecords/projectRecords.server"
import {
  assertProjectLeadOrAdmin,
  findProjectLead,
} from "@/src/server/projects/findProjectLead.server"
import { NotFoundError } from "@/src/shared/auth/errors"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { assertProjectAiEnabled } from "./incoming/checkProjectAiEnabled.server"
import { isAdminOrProjectMember } from "./incoming/checkSenderApproval.server"
import { parseEmail } from "./incoming/parseEmail.server"
import { notifyProjectRecordCreatedFromEmail } from "./notifyProjectRecordCreatedFromEmail.server"
import { projectRecordEmailInboxWhere } from "./projectRecordEmailInboxWhere"
import {
  CreateProjectRecordFromEmailSchema,
  DraftProjectRecordFromEmailSchema,
  ProjectRecordEmailInboxItemSchema,
} from "./projectRecordEmails.inputSchemas"

async function findInboxEmail(projectId: number, projectRecordEmailId: number) {
  const email = await db.projectRecordEmail.findFirst({
    where: { id: projectRecordEmailId, ...projectRecordEmailInboxWhere(projectId) },
    select: {
      id: true,
      from: true,
      subject: true,
      date: true,
      textBody: true,
      uploads: { where: { projectId }, select: { id: true } },
    },
  })
  if (!email) throw new NotFoundError()

  return email
}

async function assertInboxAccess(input: Parameters<typeof assertProjectLeadOrAdmin>[0]) {
  await assertProjectLeadOrAdmin(input)
  await assertProjectAiEnabled(input.projectId)
}

export async function getProjectRecordEmailInbox(
  headers: Headers,
  input: z.infer<typeof ProjectSlugRequiredSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
    { fresh: true },
  )
  await assertInboxAccess({ projectId, userId: Number(session.userId), membershipRole })

  return db.projectRecordEmail.findMany({
    where: projectRecordEmailInboxWhere(projectId),
    select: {
      id: true,
      createdAt: true,
      date: true,
      from: true,
      subject: true,
      uploads: { where: { projectId }, select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProjectRecordEmailInboxItem(
  headers: Headers,
  input: z.infer<typeof ProjectRecordEmailInboxItemSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
    { fresh: true },
  )
  await assertInboxAccess({ projectId, userId: Number(session.userId), membershipRole })

  const email = await db.projectRecordEmail.findFirst({
    where: { id: input.projectRecordEmailId, projectId },
    select: {
      id: true,
      createdAt: true,
      date: true,
      from: true,
      subject: true,
      text: true,
      textBody: true,
      discardedAt: true,
      uploads: { where: { projectId }, select: { id: true, title: true } },
      projectRecords: { select: { id: true, title: true } },
    },
  })
  if (!email) throw new NotFoundError()

  const { text, ...emailWithoutRawText } = email
  const isSenderKnown = await isAdminOrProjectMember({ projectId, email: email.from })

  // Attachments the listener could not upload (too large or failed) only exist in the raw mail.
  const { attachments, to, cc } = await parseEmail({ rawEmailText: text })
  const uploadedTitles = email.uploads.map(({ title }) => title)
  const skippedAttachments = attachments.flatMap(({ filename }) => {
    const index = uploadedTitles.indexOf(filename)
    if (index === -1) return [filename]
    uploadedTitles.splice(index, 1)
    return []
  })

  return { ...emailWithoutRawText, to, cc, isSenderKnown, skippedAttachments }
}

export async function draftProjectRecordFromEmail(
  headers: Headers,
  input: z.infer<typeof DraftProjectRecordFromEmailSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
    { fresh: true },
  )
  await assertInboxAccess({ projectId, userId: Number(session.userId), membershipRole })
  const email = await findInboxEmail(projectId, input.projectRecordEmailId)

  const template = input.projectRecordTemplateId
    ? await db.projectRecordTemplate.findFirst({
        where: { id: input.projectRecordTemplateId, projects: { some: { id: projectId } } },
        select: {
          id: true,
          entryTitle: true,
          body: true,
          purpose: true,
          tags: { where: { projectId, archivedAt: null }, select: { id: true } },
          formTemplates: {
            where: { projects: { some: { id: projectId } } },
            select: { id: true },
          },
        },
      })
    : null
  if (input.projectRecordTemplateId && !template) throw new NotFoundError()

  const tags = await db.tag.findMany({
    where: { projectId, archivedAt: null },
    select: { id: true, title: true },
  })

  try {
    const result = await extractProjectRecordFromEmail({
      body: email.textBody ?? "",
      subject: email.subject,
      from: email.from,
      projectContext: { tags },
      template,
      userId: String(session.userId),
    })
    const date = result.date ? new Date(result.date) : email.date
    const tagIds = new Set([
      ...(template?.tags ?? []).map(({ id }) => id),
      ...result.topics.map(Number),
    ])

    return {
      title: result.title,
      body: result.body,
      // The form takes the calendar day as seen in Germany.
      date: date && !Number.isNaN(date.getTime()) ? formatBerlinTime(date, "yyyy-MM-dd") : null,
      tags: [...tagIds],
      uploads: email.uploads.map(({ id }) => id),
      formTemplates: (template?.formTemplates ?? []).map(({ id }) => id),
      projectRecordTemplateId: template?.id ?? null,
    }
  } finally {
    await flushLangfuseSpans()
  }
}

export async function createProjectRecordFromEmail(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordFromEmailSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
    { fresh: true },
  )
  const actorUserId = Number(session.userId)
  await assertInboxAccess({ projectId, userId: actorUserId, membershipRole })
  const { projectRecordEmailId, ...recordInput } = input
  const email = await findInboxEmail(projectId, projectRecordEmailId)

  // The Projektleitung's own save is the confirmation; an admin's save waits for it.
  const projectLead = await findProjectLead(projectId)
  const projectRecord = await createProjectRecord(headers, recordInput, {
    projectRecordEmailId,
    needsConfirmation: projectLead !== null && projectLead.id !== actorUserId,
  })
  // Not awaited: the save must not wait for the mail provider.
  void notifyProjectRecordCreatedFromEmail({
    projectId,
    projectSlug: input.projectSlug,
    projectRecord,
    projectLead,
    emailFrom: email.from,
    actorUserId,
  })

  return projectRecord
}

export async function discardProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof ProjectRecordEmailInboxItemSchema>,
) {
  const { projectId, session, membershipRole } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
    { fresh: true },
  )
  await assertInboxAccess({ projectId, userId: Number(session.userId), membershipRole })

  const { count } = await db.projectRecordEmail.updateMany({
    where: { id: input.projectRecordEmailId, ...projectRecordEmailInboxWhere(projectId) },
    data: { discardedAt: new Date(), discardedById: Number(session.userId) },
  })
  if (count === 0) throw new NotFoundError()

  return { id: input.projectRecordEmailId }
}
