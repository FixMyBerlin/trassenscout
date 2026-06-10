import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { CreateSurveySessionSchema } from "./surveySessions.inputSchemas"
import { createSurveySession } from "./surveySessions.server"
export const createSurveySessionFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSurveySessionSchema)
  .handler(({ data }) => createSurveySession(getRequestHeaders(), data))
