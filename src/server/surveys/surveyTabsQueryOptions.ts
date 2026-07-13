import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getSurveyTabsFn } from "./surveyTabs.functions"
import type { GetSurveyTabsSchema } from "./surveyTabs.inputSchemas"

export function surveyTabsQueryOptions(input: z.infer<typeof GetSurveyTabsSchema>) {
  return queryOptions({
    queryKey: ["surveyTabs", input],
    queryFn: () => getSurveyTabsFn({ data: input }),
  })
}
