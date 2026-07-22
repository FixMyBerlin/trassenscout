import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles, viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { CreateSurveyResponseCommentSchema } from "@/src/shared/survey-response-comments/schemas"

export const CreateSurveyResponseCommentBySlugSchema = ProjectSlugRequiredSchema.and(
  CreateSurveyResponseCommentSchema,
)
export const UpdateSurveyResponseCommentSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
  body: CreateSurveyResponseCommentSchema.shape.body,
})
export const DeleteSurveyResponseCommentSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})

function commentInProjectWhere(projectSlug: string, id: number) {
  return { id, surveyResponse: { surveySession: { survey: { project: { slug: projectSlug } } } } }
}

export async function createSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof CreateSurveyResponseCommentBySlugSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  await db.surveyResponse.findFirstOrThrow({
    where: surveyResponseInProjectWhere(input.projectSlug, input.surveyResponseId),
    select: { id: true },
  })

  return db.surveyResponseComment.create({
    data: {
      body: input.body,
      surveyResponseId: input.surveyResponseId,
      userId: Number(session.userId),
    },
    include: { author: true },
  })
}

export async function updateSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof UpdateSurveyResponseCommentSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const previous = await db.surveyResponseComment.findFirstOrThrow({
    where: commentInProjectWhere(input.projectSlug, input.id),
    select: { id: true },
  })

  return db.surveyResponseComment.update({
    where: { id: previous.id },
    data: { body: input.body },
    include: { author: true },
  })
}

export async function deleteSurveyResponseComment(
  headers: Headers,
  input: z.infer<typeof DeleteSurveyResponseCommentSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)

  return db.surveyResponseComment.deleteMany({
    where: commentInProjectWhere(input.projectSlug, input.id),
  })
}

function surveyResponseInProjectWhere(projectSlug: string, id: number) {
  return { id, surveySession: { survey: { project: { slug: projectSlug } } } }
}
