import { SurveyResponseSourceEnum } from "@prisma/client"
import { z } from "zod"

export const SurveyResponseSchema = z.object({
  data: z.string(),
  status: z.string().nullish(),
  source: z.nativeEnum(SurveyResponseSourceEnum),
  surveySessionId: z.coerce.number(),
  surveyPart: z.coerce.number(),
  note: z.string().nullish(),
  operatorId: z.coerce.number().nullish(),
  // copied from SUbsubsection m2m2
  // // m2mFields
  surveyResponseTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const SurveyResponseFormSchema = SurveyResponseSchema.omit({
  surveyResponseTopics: true,
}).merge(
  z.object({
    // copied from SUbsubsection m2m2
    // LIST ALL m2mFields HERE
    // We need to do this manually, since dynamic zod types don't work
    surveyResponseTopics: z
      .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
      .transform((v) => v || []),
  }),
)

export const DeleteSurveyResponseSchema = z.object({ id: z.number() })
