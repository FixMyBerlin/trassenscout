import { z } from "zod"
import { SlugSchema } from "../core/utils"

export const CreateSurveySchema = z.object({
  projectId: z.coerce.number(),
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
  interestedParticipants: z.coerce.number().nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  surveyResultsUrl: z.union([
    z.string().url({ message: "Die URL ist ungültig." }).nullish(),
    // The form sumits `""` so in order to allow the field to be empty, this union is needed.
    z.literal(""),
  ]),
})

export type CreateSurveyType = z.infer<typeof CreateSurveySchema>

export const UpdateSurveySchema = z
  .object({ id: z.number() })
  .merge(CreateSurveySchema.omit({ projectId: true }))
