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
  id: z.number(),
  title: z.string().trim().min(1),
})

export const SurveyResponseTagIdSchema = ProjectSlugRequiredSchema.extend({
  id: z.number(),
})
