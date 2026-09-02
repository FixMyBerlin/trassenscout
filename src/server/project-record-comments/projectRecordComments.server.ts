import type { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import {
  loadUserRedactionContext,
  redactCommentAuthor,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import {
  CreateProjectRecordCommentBySlugSchema,
  DeleteProjectRecordCommentSchema,
  GetProjectRecordCommentsSchema,
  UpdateProjectRecordCommentSchema,
} from "./projectRecordComments.inputSchemas"

const commentAuthorSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const

function commentInProjectWhere(projectSlug: string, id: number) {
  return { id, projectRecord: { project: { slug: projectSlug } } }
}

export async function getProjectRecordComments(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordCommentsSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const comments = await db.projectRecordComment.findMany({
    include: { author: { select: commentAuthorSelect } },
    orderBy: { id: "asc" },
    where: {
      ...(input.projectRecordId ? { projectRecordId: input.projectRecordId } : {}),
      projectRecord: { project: { slug: input.projectSlug } },
    },
  })
  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return comments.map((comment) => redactCommentAuthor(comment, redactionContext))
}

export async function createProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordCommentBySlugSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const projectRecord = await db.projectRecord.findFirstOrThrow({
    where: { id: input.projectRecordId, project: { slug: input.projectSlug } },
    select: { id: true, title: true, projectId: true },
  })

  const comment = await db.projectRecordComment.create({
    data: {
      body: input.body,
      projectRecordId: input.projectRecordId,
      userId: Number(session.userId),
    },
    include: { author: { select: commentAuthorSelect } },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Neuer Kommentar im Protokolleintrag ${frenchQuote(projectRecord.title)} wurde erstellt.`,
    userId: Number(session.userId),
    projectId: projectRecord.projectId,
    projectRecordId: projectRecord.id,
    projectRecordCommentId: comment.id,
    updatedRecord: {
      id: comment.id,
      body: comment.body,
      projectRecordId: comment.projectRecordId,
      userId: comment.userId,
    },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactCommentAuthor(comment, redactionContext)
}

export async function updateProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordCommentSchema>,
) {
  const { membershipRole, projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const canEditAnyComment = membershipRole === null || membershipRole === "EDITOR"
  const previous = await db.projectRecordComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      userId: true,
      body: true,
      projectRecord: { select: { id: true, title: true, projectId: true } },
    },
  })

  if (!canEditAnyComment && previous.userId !== Number(session.userId)) {
    throw new AuthorizationError()
  }

  const comment = await db.projectRecordComment.update({
    where: { id: previous.id },
    data: { body: input.body },
    include: { author: { select: commentAuthorSelect } },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Kommentar im Protokolleintrag ${frenchQuote(previous.projectRecord.title)} wurde bearbeitet.`,
    userId: Number(session.userId),
    projectId: previous.projectRecord.projectId,
    projectRecordId: previous.projectRecord.id,
    projectRecordCommentId: comment.id,
    previousRecord: { id: previous.id, body: previous.body, userId: previous.userId },
    updatedRecord: { id: comment.id, body: comment.body, userId: comment.userId },
  })

  const redactionContext = await loadUserRedactionContext(
    projectId,
    session.role,
    Number(session.userId),
  )
  return redactCommentAuthor(comment, redactionContext)
}

export async function deleteProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordCommentSchema>,
) {
  const { membershipRole, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const canDeleteAnyComment = membershipRole === null || membershipRole === "EDITOR"
  const previous = await db.projectRecordComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: {
      id: true,
      userId: true,
      projectRecord: { select: { id: true, title: true, projectId: true } },
    },
  })

  if (!canDeleteAnyComment && previous.userId !== Number(session.userId)) {
    throw new AuthorizationError()
  }

  const deleted = await db.projectRecordComment.deleteMany({
    where: commentInProjectWhere(input.projectSlug, previous.id),
  })

  await createLogEntry({
    action: "DELETE",
    message: `Kommentar im Protokolleintrag ${frenchQuote(previous.projectRecord.title)} wurde gelöscht.`,
    userId: Number(session.userId),
    projectId: previous.projectRecord.projectId,
    projectRecordId: previous.projectRecord.id,
    previousRecord: { id: previous.id },
  })

  return deleted
}
