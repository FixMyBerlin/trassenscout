import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSurveyResponseTopicSchema,
  GetSurveyResponseTopicsSchema,
} from "./surveyResponseTopics.inputSchemas"
import {
  createSurveyResponseTopic,
  getSurveyResponseTopicsByProject,
} from "./surveyResponseTopics.server"
export const getSurveyResponseTopicsByProjectFn = createServerFn({ method: "GET" })
  .inputValidator(GetSurveyResponseTopicsSchema)
  .handler(({ data }) => getSurveyResponseTopicsByProject(getRequestHeaders(), data))

export const createSurveyResponseTopicFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSurveyResponseTopicSchema)
  .handler(({ data }) => createSurveyResponseTopic(getRequestHeaders(), data))
