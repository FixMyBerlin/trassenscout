import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import {
  getAdminSurveyFn,
  getAdminSurveysByProjectFn,
  getSurveyFn,
  getSurveysFn,
} from "./surveys.functions"
import type { GetSurveySchema } from "./surveys.inputSchemas"
import type { GetSurveysInput } from "./surveys.server"

export function surveysQueryOptions(input: GetSurveysInput) {
  return queryOptions({
    queryKey: ["surveys", input],
    queryFn: () => getSurveysFn({ data: input }),
  })
}

export function surveyQueryOptions(input: z.infer<typeof GetSurveySchema>) {
  return queryOptions({
    queryKey: ["survey", input],
    queryFn: () => getSurveyFn({ data: input }),
  })
}

export function adminSurveysByProjectQueryOptions(projectSlug: string) {
  return queryOptions({
    queryKey: ["adminSurveys", projectSlug],
    queryFn: () => getAdminSurveysByProjectFn({ data: { projectSlug } }),
  })
}

export function adminSurveyQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["adminSurvey", id],
    queryFn: () => getAdminSurveyFn({ data: { id } }),
  })
}
