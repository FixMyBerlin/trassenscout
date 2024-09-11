import { SlugSchema } from "src/core/utils"
import { z } from "zod"

export const CreateSurveySchema = z.object({
  projectSlug: SlugSchema,
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
  interestedParticipants: z.number().nullish(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  surveyResultsUrl: z.union([
    z.string().url({ message: "Die URL ist ungültig." }).nullish(),
    // The form sumits `""` so in order to allow the field to be empty, this union is needed.
    z.literal(""),
  ]),
})

export const UpdateSurveySchema = z
  .object({
    id: z.number(),
  })
  .merge(CreateSurveySchema.omit({ projectSlug: true }))

export const DeleteSurveySchema = z.object({
  id: z.number(),
})
