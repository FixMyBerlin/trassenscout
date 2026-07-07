import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import {
  CreateSurveyResponseTagSchema,
  GetSurveyResponseTagsSchema,
  SurveyResponseTagIdSchema,
  UpdateSurveyResponseTagSchema,
} from "./surveyResponseTags.inputSchemas"
import { getSurveyResponseTagUsageCount } from "./surveyResponseTagUsageCount"

function tagInProjectWhere(projectSlug: string, id?: number) {
  return {
    ...(id ? { id } : {}),
    project: { slug: projectSlug },
  }
}

async function getSurveyResponseTagUsageCountForTag(projectSlug: string, tagId: number) {
  return getSurveyResponseTagUsageCount(projectSlug, tagId)
}

export type GetSurveyResponseTagsInput = z.infer<typeof GetSurveyResponseTagsSchema>

export async function getSurveyResponseTagsWithUsageCount(
  headers: Headers,
  input: GetSurveyResponseTagsInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const surveyResponseTags = await db.surveyResponseTag.findMany({
    where: {
      project: { slug: input.projectSlug },
    },
    orderBy: { title: "asc" },
  })

  const surveyResponseTagsWithUsageCount = await Promise.all(
    surveyResponseTags.map(async (tag) => ({
      ...tag,
      usageCount: await getSurveyResponseTagUsageCountForTag(input.projectSlug, tag.id),
    })),
  )

  return { surveyResponseTags: surveyResponseTagsWithUsageCount }
}

export async function getSurveyResponseTagsByProject(
  headers: Headers,
  input: GetSurveyResponseTagsInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const surveyResponseTags = await db.surveyResponseTag.findMany({
    where: {
      project: { slug: input.projectSlug },
      ...(input.includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: { title: "asc" },
  })

  return { surveyResponseTags }
}

export async function createSurveyResponseTag(
  headers: Headers,
  input: z.infer<typeof CreateSurveyResponseTagSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug: _projectSlug, title } = input

  return db.surveyResponseTag.upsert({
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

export async function updateSurveyResponseTag(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyResponseTagSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug, title } = input

  const tag = await db.surveyResponseTag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.surveyResponseTag.update({
    where: { id: tag.id },
    data: { title },
  })
}

export async function archiveSurveyResponseTag(
  headers: Headers,
  input: z.infer<typeof SurveyResponseTagIdSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.surveyResponseTag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.surveyResponseTag.update({
    where: { id: tag.id },
    data: { archivedAt: new Date() },
  })
}

export async function unarchiveSurveyResponseTag(
  headers: Headers,
  input: z.infer<typeof SurveyResponseTagIdSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.surveyResponseTag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  return db.surveyResponseTag.update({
    where: { id: tag.id },
    data: { archivedAt: null },
  })
}

export async function deleteSurveyResponseTag(
  headers: Headers,
  input: z.infer<typeof SurveyResponseTagIdSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { id, projectSlug } = input

  const tag = await db.surveyResponseTag.findFirstOrThrow({
    where: tagInProjectWhere(projectSlug, id),
  })

  const usageCount = await getSurveyResponseTagUsageCountForTag(projectSlug, tag.id)
  if (usageCount > 0) {
    throw new Error("Tag kann nicht gelöscht werden, solange es noch verwendet wird.")
  }

  return db.surveyResponseTag.delete({
    where: { id: tag.id },
  })
}

export { CreateSurveyResponseTagSchema }
