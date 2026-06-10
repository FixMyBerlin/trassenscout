import { z } from "zod"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"

export const GetSurveyTabsSchema = ProjectSlugRequiredSchema.extend({
  surveyId: z.number(),
})
