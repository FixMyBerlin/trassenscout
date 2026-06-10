import { z } from "zod"
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
