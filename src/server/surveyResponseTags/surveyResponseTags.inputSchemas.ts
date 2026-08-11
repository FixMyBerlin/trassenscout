import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { SurveyResponseTagSchema } from "./schemas"

export const GetSurveyResponseTagsSchema = ProjectSlugRequiredSchema.extend({
  includeArchived: z.boolean().optional(),
})

export const CreateSurveyResponseTagSchema = ProjectSlugRequiredSchema.extend(
  SurveyResponseTagSchema.omit({ projectId: true }).shape,
)

export const UpdateSurveyResponseTagSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().trim().nullish(),
})

export const SurveyResponseTagIdSchema = ProjectSlugRequiredSchema.extend({
  id: z.number().int().positive(),
})
