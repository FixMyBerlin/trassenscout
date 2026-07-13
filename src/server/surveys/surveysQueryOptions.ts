import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getAdminSurveyFn, getAdminSurveysFn, getSurveyFn, getSurveysFn } from "./surveys.functions"
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

export function adminSurveysQueryOptions() {
  return queryOptions({
    queryKey: ["adminSurveys"],
    queryFn: () => getAdminSurveysFn({ data: {} }),
  })
}

export function adminSurveyQueryOptions(id: number) {
  return queryOptions({
    queryKey: ["adminSurvey", id],
    queryFn: () => getAdminSurveyFn({ data: { id } }),
  })
}
