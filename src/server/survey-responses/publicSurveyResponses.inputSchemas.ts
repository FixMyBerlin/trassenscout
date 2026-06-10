import { z } from "zod"
import { allowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { SurveyResponseSourceEnum, SurveyResponseStateEnum } from "@/src/prisma/generated/client"

export const GetOrCreateCreatedSurveyResponsePublicSchema = z.object({
  surveySessionId: z.number().int().positive(),
  surveyPart: z.number().int().positive(),
  data: z.string(),
  source: z.enum(SurveyResponseSourceEnum),
  status: z.string().optional(),
})

export const UpdateSurveyResponsePublicSchema = z.object({
  id: z.number(),
  surveySessionId: z.number(),
  data: z.string(),
  state: z.enum(SurveyResponseStateEnum),
})

export const SurveyPart2EmailSchema = z.object({
  surveySessionId: z.number(),
  data: z.record(z.string(), z.unknown()),
  surveySlug: z.enum(allowedSurveySlugs),
  searchParams: z.record(z.string(), z.string()).nullable(),
})
