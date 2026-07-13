import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  GetOrCreateCreatedSurveyResponsePublicSchema,
  SurveyPart2EmailSchema,
  UpdateSurveyResponsePublicSchema,
} from "./publicSurveyResponses.inputSchemas"
import {
  getOrCreateCreatedSurveyResponsePublic,
  sendSurveyPart2Email,
  updateSurveyResponsePublic,
} from "./publicSurveyResponses.server"
export const getOrCreateCreatedSurveyResponsePublicFn = createServerFn({ method: "POST" })
  .validator(GetOrCreateCreatedSurveyResponsePublicSchema)
  .handler(({ data }) => getOrCreateCreatedSurveyResponsePublic(getRequestHeaders(), data))

export const updateSurveyResponsePublicFn = createServerFn({ method: "POST" })
  .validator(UpdateSurveyResponsePublicSchema)
  .handler(({ data }) => updateSurveyResponsePublic(getRequestHeaders(), data))

export const sendSurveyPart2EmailFn = createServerFn({ method: "POST" })
  .validator(SurveyPart2EmailSchema)
  .handler(({ data }) => sendSurveyPart2Email(getRequestHeaders(), data))
