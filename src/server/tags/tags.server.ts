import type { z } from "zod"
import { Prisma, type TagColorEnum, UserRoleEnum } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { AuthorizationError, authMessages } from "@/src/shared/auth/errors"
import { CreateTagSchema, GetTagsSchema, TagIdSchema, UpdateTagSchema } from "./tags.inputSchemas"
import { getTagUsageCount } from "./tagUsageCount"

export const TAG_TITLE_TAKEN = "Tag title already exists"

function sameTitleWhere(projectId: number, title: string) {
  return { projectId, title: { equals: title, mode: "insensitive" as const } }
}

function adminTagData(
  role: string,
  { description, color }: { description?: string | null; color?: TagColorEnum },
) {
  if (description === undefined && color === undefined) return null
  if (role !== UserRoleEnum.ADMIN) throw new AuthorizationError(authMessages.adminAccessRequired)
  return {
    ...(description !== undefined ? { description: description || null } : {}),
    ...(color !== undefined ? { color } : {}),
  }
}

function tagInProjectWhere(projectSlug: string, id?: number) {
  return {
    ...(id !== undefined ? { id } : {}),
    project: { slug: projectSlug },
  }
}

export async function getTagsByProject(headers: Headers, input: z.infer<typeof GetTagsSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const tags = await db.tag.findMany({
    where: {
      project: { slug: input.projectSlug },
      ...(input.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: { title: "asc" },
  })

  return { tags }
}

export async function getTagsWithUsageCount(
  headers: Headers,
  input: z.infer<typeof GetTagsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const tags = await db.tag.findMany({
    where: tagInProjectWhere(input.projectSlug),
    orderBy: { title: "asc" },
  })

  const tagsWithUsageCount = await Promise.all(
    tags.map(async (tag) => ({
      ...tag,
      usageCount: await getTagUsageCount(input.projectSlug, tag.id),
    })),
  )

  return { tags: tagsWithUsageCount }
}

export async function createTag(headers: Headers, input: z.infer<typeof CreateTagSchema>) {
  const { projectId, session } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const { title } = input
  const adminData = adminTagData(session.role, input)

  const existing = await db.tag.findFirst({ where: sameTitleWhere(projectId, title) })
  if (existing) {
    if (adminData) throw new Error(TAG_TITLE_TAKEN)
    if (!existing.archivedAt) return existing
    return db.tag.update({ where: { id: existing.id }, data: { archivedAt: null } })
  }

  try {
    return await db.tag.create({ data: { title, projectId, ...adminData } })
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"))
      throw error
    if (adminData) throw new Error(TAG_TITLE_TAKEN)
    return db.tag.findFirstOrThrow({ where: sameTitleWhere(projectId, title) })
  }
}

export async function updateTag(headers: Headers, input: z.infer<typeof UpdateTagSchema>) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, title } = input
  const adminData = adminTagData(session.role, input)

  const tag = await db.tag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })
  const duplicate = await db.tag.findFirst({
    where: { ...sameTitleWhere(tag.projectId, title), id: { not: tag.id } },
    select: { id: true },
  })
  if (duplicate) throw new Error(TAG_TITLE_TAKEN)

  return db.tag.update({
    where: { id: tag.id },
    data: { title, ...adminData },
  })
}

export async function archiveTag(headers: Headers, input: z.infer<typeof TagIdSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.tag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.tag.update({
    where: { id: tag.id },
    data: { archivedAt: new Date() },
  })
}

export async function unarchiveTag(headers: Headers, input: z.infer<typeof TagIdSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.tag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.tag.update({
    where: { id: tag.id },
    data: { archivedAt: null },
  })
}

export async function deleteTag(headers: Headers, input: z.infer<typeof TagIdSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.tag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  const usageCount = await getTagUsageCount(projectSlug, tag.id)
  if (usageCount > 0) {
    throw new Error("Tag kann nicht gelöscht werden, solange es noch verwendet wird.")
  }

  return db.tag.delete({
    where: { id: tag.id },
  })
}
