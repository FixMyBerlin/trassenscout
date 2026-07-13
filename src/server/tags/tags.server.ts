import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { CreateTagSchema, GetTagsSchema, TagIdSchema, UpdateTagSchema } from "./tags.inputSchemas"
import { getTagUsageCount } from "./tagUsageCount"

function tagInProjectWhere(projectSlug: string, id?: number) {
  return {
    ...(id ? { id } : {}),
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
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug: _projectSlug, title } = input

  return db.tag.upsert({
    where: {
      title_projectId: {
        title,
        projectId,
      },
    },
    update: {},
    create: {
      title,
      projectId,
    },
  })
}

export async function updateTag(headers: Headers, input: z.infer<typeof UpdateTagSchema>) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, title } = input

  const tag = await db.tag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.tag.update({
    where: { id: tag.id },
    data: { title },
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
