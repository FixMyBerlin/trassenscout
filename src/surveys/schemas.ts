import { z } from "zod"
import { SlugSchema } from "src/core/utils"

export const CreateSurveySchema = z.object({
  projectSlug: SlugSchema,
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
  interestedParticipants: z.number().nullish(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  externalUrlSurveyResults: z.string().url({ message: "Die URL ist ungültig." }).nullish(),
  surveyUrl: z.string().url({ message: "Die URL ist ungültig." }).nullish(),
})

export const UpdateSurveySchema = z.object({
  id: z.number(),
  interestedParticipants: z.number().nullish(),
  startDate: z.date().nullish(),
  endDate: z.date().nullish(),
  slug: SlugSchema,
  title: z.string().min(3, { message: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
  externalUrlSurveyResults: z.string().url({ message: "Die URL ist ungültig." }).nullish(),
  surveyUrl: z.string().url({ message: "Die URL ist ungültig." }).nullish(),

})

export const DeleteSurveySchema = z.object({
  id: z.number(),
})
