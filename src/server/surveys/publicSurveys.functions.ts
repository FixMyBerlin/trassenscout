import { createServerFn } from "@tanstack/react-start"
import { GetPublicSurveyBySlugSchema } from "./publicSurveys.inputSchemas"
import { getPublicSurveyBySlug } from "./publicSurveys.server"
export const getPublicSurveyBySlugFn = createServerFn({ method: "GET" })
  .validator(GetPublicSurveyBySlugSchema)
  .handler(({ data }) => getPublicSurveyBySlug(data))
