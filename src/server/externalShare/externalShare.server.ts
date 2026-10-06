import type { z } from "zod"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { NotFoundError } from "@/src/shared/auth/errors"
import { loadExternalShareContent } from "./_utils/externalShareContent.server"
import { createExternalShareToken } from "./_utils/externalShareToken.server"
import type {
  GetExternalShareSchema,
  RemoveUploadFromExternalShareSchema,
  RotateExternalShareTokenSchema,
} from "./externalShare.inputSchemas"

export async function getExternalShare(
  headers: Headers,
  input: z.infer<typeof GetExternalShareSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { externalShareEnabled: true, externalShareToken: true },
  })
  if (!project.externalShareEnabled) {
    throw new NotFoundError()
  }

  return { token: project.externalShareToken, ...(await loadExternalShareContent(projectId)) }
}

export async function rotateExternalShareToken(
  headers: Headers,
  input: z.infer<typeof RotateExternalShareTokenSchema>,
) {
  const session = await endpointAuth.admin(headers)

  const project = await db.project.update({
    where: { slug: input.projectSlug },
    data: { externalShareToken: createExternalShareToken() },
    select: { id: true },
  })
  // CREATE: an UPDATE without a diff is dropped, and the token must never be stored as one.
  await createLogEntry({
    action: "CREATE",
    message:
      "Ein neuer Geheimlink für die Externe Freigabe wurde erstellt, der bisherige ist ungültig.",
    userId: Number(session.userId),
    projectId: project.id,
  })
}

export async function removeUploadFromExternalShare(
  headers: Headers,
  input: z.infer<typeof RemoveUploadFromExternalShareSchema>,
) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )

  const upload = await db.upload.findFirst({
    where: { id: input.id, projectId },
    select: { id: true, title: true, externalShareEnabled: true },
  })
  if (!upload) {
    throw new NotFoundError()
  }
  if (!upload.externalShareEnabled) return

  const userId = Number(session.userId)
  await db.upload.update({
    where: { id: upload.id },
    data: { externalShareEnabled: false, updatedById: userId },
  })
  await createLogEntry({
    action: "UPDATE",
    message: `Dokument ${frenchQuote(upload.title)} wurde aus der Externen Freigabe entfernt.`,
    userId,
    projectId,
    uploadId: upload.id,
    previousRecord: { externalShareEnabled: true },
    updatedRecord: { externalShareEnabled: false },
  })
}
