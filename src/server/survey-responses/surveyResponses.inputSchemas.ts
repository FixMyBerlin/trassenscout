import { z } from "zod"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { SurveyResponseFormSchema, SurveyResponseSchema } from "./schemas"

export const GetSurveyResponsesSchema = ProjectSlugRequiredSchema.extend({
  surveyId: z.number().optional(),
})
export const GetSurveyResponseSchema = ProjectSlugRequiredSchema.extend({ id: z.number() })
export const CreateSurveyResponseBySlugSchema =
  ProjectSlugRequiredSchema.and(SurveyResponseFormSchema)
export const UpdateSurveyResponseBySlugSchema =
  GetSurveyResponseSchema.and(SurveyResponseFormSchema)
export const DeleteSurveyResponseBySlugSchema = GetSurveyResponseSchema
export const GetFeedbackSurveyResponsesSchema = ProjectSlugRequiredSchema.extend({
  surveyId: z.number(),
})
export const GetGroupedSurveyResponsesSchema = GetFeedbackSurveyResponsesSchema
export const PatchSurveyResponseSchema = GetSurveyResponseSchema.extend(
  SurveyResponseSchema.omit({ data: true, surveySessionId: true, surveyPart: true }).partial()
    .shape,
).extend({
  surveyResponseTopics: z
    .union([z.undefined(), z.boolean(), z.array(z.coerce.number())])
    .optional(),
})
export const GetCreatedSurveyResponsesSchema = AllowedSurveySlugsSchema
export const GetTestSurveyResponsesSchema = AllowedSurveySlugsSchema
export const DeleteTestSurveyResponsesSchema = AllowedSurveySlugsSchema.extend({
  deleteIds: z.array(z.number()),
})
export const GetLinkedSurveyResponseForSubsubsectionSchema = ProjectSlugRequiredSchema.extend({
  subsubsectionSlug: z.string(),
})
