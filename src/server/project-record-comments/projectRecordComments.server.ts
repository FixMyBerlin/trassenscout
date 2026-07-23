import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import {
  CreateProjectRecordCommentBySlugSchema,
  DeleteProjectRecordCommentSchema,
  GetProjectRecordCommentsSchema,
  UpdateProjectRecordCommentSchema,
} from "./projectRecordComments.inputSchemas"

function commentInProjectWhere(projectSlug: string, id: number) {
  return { id, projectRecord: { project: { slug: projectSlug } } }
}

export async function getProjectRecordComments(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordCommentsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  return db.projectRecordComment.findMany({
    include: { author: true },
    orderBy: { id: "asc" },
    where: {
      ...(input.projectRecordId ? { projectRecordId: input.projectRecordId } : {}),
      projectRecord: { project: { slug: input.projectSlug } },
    },
  })
}

export async function createProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordCommentBySlugSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  await db.projectRecord.findFirstOrThrow({
    where: { id: input.projectRecordId, project: { slug: input.projectSlug } },
    select: { id: true },
  })

  return db.projectRecordComment.create({
    data: {
      body: input.body,
      projectRecordId: input.projectRecordId,
      userId: Number(session.userId),
    },
    include: { author: true },
  })
}

export async function updateProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordCommentSchema>,
) {
  const { membershipRole, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    viewerRoles,
  )
  const canEditAnyComment = membershipRole === null || membershipRole === "EDITOR"
  const previous = await db.projectRecordComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: { id: true, userId: true },
  })

  if (!canEditAnyComment && previous.userId !== Number(session.userId)) {
    throw new AuthorizationError()
  }

  return db.projectRecordComment.update({
    where: { id: previous.id },
    data: { body: input.body },
    include: { author: true },
  })
}

export async function deleteProjectRecordComment(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordCommentSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  return db.projectRecordComment.deleteMany({
    where: commentInProjectWhere(input.projectSlug, input.id),
  })
}
