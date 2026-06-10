import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { SurveyResponseTopicSchema } from "./schemas"

export const GetSurveyResponseTopicsSchema = ProjectSlugRequiredSchema
export const CreateSurveyResponseTopicSchema = ProjectSlugRequiredSchema.extend(
  SurveyResponseTopicSchema.omit({ projectId: true }).shape,
)
