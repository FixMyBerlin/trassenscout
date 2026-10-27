import type { z } from "zod"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import type { Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { readableProjectWhere } from "@/src/server/authorization/readableProjectWhere.server"
import db from "@/src/server/db.server"
import {
  getUserRedactionContext,
  loadUserRedactionContexts,
  redactUploadUsers,
} from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import { toCursorPage } from "@/src/server/utils/cursorPage.server"
import { uploadWithSubsectionsInclude } from "./_utils/uploadInclude"
import type { GetMyUploadsSchema, GetMyUploadTagsSchema } from "./uploads.inputSchemas"

const MY_UPLOADS_PAGE_SIZE = 50

// As on the project's Dokumente page: only reachable through their Eingabe.
const surveyOnlyUploadWhere = {
  surveyResponseId: { not: null },
  projectRecordEmailId: null,
  projectRecords: { none: {} },
  subsubsections: { none: {} },
  acquisitionAreas: { none: {} },
} satisfies Prisma.UploadWhereInput

const containsInsensitive = (value: string) => ({ contains: value, mode: "insensitive" as const })

function visibleUploadWhere(userId: number, role: string, projectSlug: string | undefined) {
  return {
    // Support documents have no project.
    projectId: { not: null },
    project: readableProjectWhere(userId, role, projectSlug),
    NOT: surveyOnlyUploadWhere,
  } satisfies Prisma.UploadWhereInput
}

export async function getMyUploads(headers: Headers, input: z.infer<typeof GetMyUploadsSchema>) {
  const session = await endpointAuth.session(headers)
  const userId = Number(session.userId)
  const searchterm = normalizeSearchterm(input.searchterm ?? "")

  const where = {
    ...visibleUploadWhere(userId, session.role, input.projectSlug),
    ...(input.tag
      ? { tags: { some: { title: { equals: input.tag, mode: "insensitive" as const } } } }
      : {}),
    ...(input.cursor ? { id: { lt: input.cursor } } : {}),
    // Not the URL: the title holds the uploaded file name.
    ...(searchterm
      ? {
          OR: [
            { title: containsInsensitive(searchterm) },
            { summary: containsInsensitive(searchterm) },
          ],
        }
      : {}),
  } satisfies Prisma.UploadWhereInput

  const rows = await db.upload.findMany({
    where,
    include: uploadWithSubsectionsInclude,
    orderBy: { id: "desc" },
    take: MY_UPLOADS_PAGE_SIZE + 1,
  })
  const page = toCursorPage(rows, MY_UPLOADS_PAGE_SIZE, (upload) => upload.id)

  const projectIds = [...new Set(page.items.flatMap((upload) => upload.projectId ?? []))]
  const contexts = await loadUserRedactionContexts(projectIds, session.role, userId)

  return {
    uploads: page.items.flatMap((upload) =>
      upload.projectId === null
        ? []
        : [redactUploadUsers(upload, getUserRedactionContext(contexts, upload.projectId))],
    ),
    nextCursor: page.nextCursor,
  }
}

export async function getMyUploadTags(
  headers: Headers,
  input: z.infer<typeof GetMyUploadTagsSchema>,
) {
  const session = await endpointAuth.session(headers)

  const tags = await db.tag.findMany({
    where: {
      uploads: {
        some: visibleUploadWhere(Number(session.userId), session.role, input.projectSlug),
      },
    },
    select: { title: true },
  })

  return { tags }
}
