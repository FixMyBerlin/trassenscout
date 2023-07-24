import { z } from "zod"
import { SlugSchema } from "src/core/utils"

export const CreateSurveySchema = z.object({
  projectSlug: SlugSchema,
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
})

export const UpdateSurveySchema = z.object({
  id: z.number(),
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
})

export const DeleteSurveySchema = z.object({
  id: z.number(),
})
