import { z } from "zod"
import { SurveyResponseSourceEnum } from "@/src/prisma/generated/browser"

export const SurveyResponseSchema = z.object({
  data: z.string(),
  status: z.string().nullish(),
  source: z.enum(SurveyResponseSourceEnum),
  surveySessionId: z.coerce.number(),
  surveyPart: z.coerce.number(),
  note: z.string().nullish(),
  operatorId: z.coerce.number().nullish(),
  surveyResponseTopics: z.union([z.literal(false), z.array(z.coerce.number())]).optional(),
})

export const SurveyResponseFormSchema = SurveyResponseSchema.omit({
  surveyResponseTopics: true,
}).extend({
  surveyResponseTopics: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .transform((v) => v || []),
})
