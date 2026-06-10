import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { SurveyResponseTopicSchema } from "./schemas"
import { GetSurveyResponseTopicsSchema } from "./surveyResponseTopics.inputSchemas"

export const CreateSurveyResponseTopicSchema = ProjectSlugRequiredSchema.extend(
  SurveyResponseTopicSchema.omit({ projectId: true }).shape,
)

export type GetSurveyResponseTopicsInput = z.infer<typeof GetSurveyResponseTopicsSchema>

export async function getSurveyResponseTopicsByProject(
  headers: Headers,
  input: GetSurveyResponseTopicsInput,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const surveyResponseTopics = await db.surveyResponseTopic.findMany({
    where: { project: { slug: input.projectSlug } },
    orderBy: { title: "asc" },
  })

  return { surveyResponseTopics }
}

export async function createSurveyResponseTopic(
  headers: Headers,
  input: z.infer<typeof CreateSurveyResponseTopicSchema>,
) {
  const { projectId } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { projectSlug: _projectSlug, title } = input

  return db.surveyResponseTopic.upsert({
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
