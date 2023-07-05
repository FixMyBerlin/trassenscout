import { z } from "zod"
import { SlugSchema } from "../core/utils"

export const CreateSurveySchema = z.object({
  slug: SlugSchema,
})

export const UpdateSurveySchema = z.object({
  id: z.number(),
  slug: SlugSchema,
})

export const DeleteSurveySchema = z.object({
  id: z.number(),
})
