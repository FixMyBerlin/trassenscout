import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSurveyResponseCommentBySlugSchema,
  DeleteSurveyResponseCommentSchema,
  UpdateSurveyResponseCommentSchema,
} from "./surveyResponseComments.inputSchemas"
import {
  createSurveyResponseComment,
  deleteSurveyResponseComment,
  updateSurveyResponseComment,
} from "./surveyResponseComments.server"

export const createSurveyResponseCommentFn = createServerFn({ method: "POST" })
  .validator(CreateSurveyResponseCommentBySlugSchema)
  .handler(({ data }) => createSurveyResponseComment(getRequestHeaders(), data))

export const updateSurveyResponseCommentFn = createServerFn({ method: "POST" })
  .validator(UpdateSurveyResponseCommentSchema)
  .handler(({ data }) => updateSurveyResponseComment(getRequestHeaders(), data))

export const deleteSurveyResponseCommentFn = createServerFn({ method: "POST" })
  .validator(DeleteSurveyResponseCommentSchema)
  .handler(({ data }) => deleteSurveyResponseComment(getRequestHeaders(), data))
