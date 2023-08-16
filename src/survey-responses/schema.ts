import { SurveyResponseStatusEnum } from "@prisma/client"
import { z } from "zod"

export const SurveyResponseSchema = z.object({
  data: z.string(),
  status: z.nativeEnum(SurveyResponseStatusEnum),
  surveySessionId: z.coerce.number(),
  surveyId: z.coerce.number(),
  note: z.string().nullish(),
  operatorId: z.coerce.number().nullish(),
})
