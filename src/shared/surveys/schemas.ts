import { z } from "zod"
import { SlugSchema } from "@/src/components/core/utils/schema-shared"

export const CreateSurveySchema = z.object({
  projectId: z.coerce.number(),
  slug: SlugSchema,
  title: z.string().min(3, { error: "Pflichtfeld. Mindestens 3 Zeichen." }),
  active: z.coerce.boolean(),
  interestedParticipants: z.coerce.number().nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  surveyResultsUrl: z.union([
    z.url({ error: "Die URL ist ungültig." }).nullish(),
    // The form submits `""` so in order to allow the field to be empty, this union is needed.
    z.literal(""),
  ]),
})

export type CreateSurveyType = z.infer<typeof CreateSurveySchema>

export const createSurveyFormDefaultValues: CreateSurveyType = {
  projectId: 0,
  slug: "",
  title: "",
  active: true,
  interestedParticipants: null,
  startDate: null,
  endDate: null,
  surveyResultsUrl: "",
}

export const UpdateSurveySchema = z
  .object({ id: z.number() })
  .extend(CreateSurveySchema.omit({ projectId: true }).shape)
