import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { GetSurveyTabsSchema } from "./surveyTabs.inputSchemas"
import { getSurveyTabs } from "./surveyTabs.server"
export const getSurveyTabsFn = createServerFn({ method: "GET" })
  .inputValidator(GetSurveyTabsSchema)
  .handler(({ data }) => getSurveyTabs(getRequestHeaders(), data))
