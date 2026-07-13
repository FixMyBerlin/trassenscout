import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSurveyResponseBySlugSchema,
  DeleteSurveyResponseBySlugSchema,
  DeleteTestSurveyResponsesSchema,
  GetCreatedSurveyResponsesSchema,
  GetFeedbackSurveyResponsesSchema,
  GetGroupedSurveyResponsesSchema,
  GetLinkedSurveyResponseForSubsubsectionSchema,
  GetSurveyResponseSchema,
  GetSurveyResponsesSchema,
  GetTestSurveyResponsesSchema,
  PatchSurveyResponseSchema,
  UpdateSurveyResponseBySlugSchema,
} from "./surveyResponses.inputSchemas"
import {
  createSurveyResponse,
  deleteSurveyResponseAsAdmin,
  deleteTestSurveyResponses,
  getCreatedSurveyResponses,
  getFeedbackSurveyResponsesWithSurveyDataAndComments,
  getGroupedSurveyResponses,
  getLinkedSurveyResponseForSubsubsection,
  getSurveyResponse,
  getSurveyResponses,
  getTestSurveyResponses,
  patchSurveyResponse,
  updateSurveyResponse,
} from "./surveyResponses.server"
export const getSurveyResponsesFn = createServerFn({ method: "GET" })
  .validator(GetSurveyResponsesSchema)
  .handler(({ data }) => getSurveyResponses(getRequestHeaders(), data))

const _getSurveyResponseFn = createServerFn({ method: "GET" })
  .validator(GetSurveyResponseSchema)
  .handler(({ data }) => getSurveyResponse(getRequestHeaders(), data))

export const getFeedbackSurveyResponsesWithSurveyDataAndCommentsFn = createServerFn({
  method: "GET",
})
  .validator(GetFeedbackSurveyResponsesSchema)
  .handler(({ data }) =>
    getFeedbackSurveyResponsesWithSurveyDataAndComments(getRequestHeaders(), data),
  )

export const getGroupedSurveyResponsesFn = createServerFn({ method: "GET" })
  .validator(GetGroupedSurveyResponsesSchema)
  .handler(({ data }) => getGroupedSurveyResponses(getRequestHeaders(), data))

export const getLinkedSurveyResponseForSubsubsectionFn = createServerFn({ method: "GET" })
  .validator(GetLinkedSurveyResponseForSubsubsectionSchema)
  .handler(({ data }) => getLinkedSurveyResponseForSubsubsection(getRequestHeaders(), data))

const _createSurveyResponseFn = createServerFn({ method: "POST" })
  .validator(CreateSurveyResponseBySlugSchema)
  .handler(({ data }) => createSurveyResponse(getRequestHeaders(), data))

const _updateSurveyResponseFn = createServerFn({ method: "POST" })
  .validator(UpdateSurveyResponseBySlugSchema)
  .handler(({ data }) => updateSurveyResponse(getRequestHeaders(), data))

export const patchSurveyResponseFn = createServerFn({ method: "POST" })
  .validator(PatchSurveyResponseSchema)
  .handler(({ data }) => patchSurveyResponse(getRequestHeaders(), data))

export const deleteSurveyResponseAsAdminFn = createServerFn({ method: "POST" })
  .validator(DeleteSurveyResponseBySlugSchema)
  .handler(({ data }) => deleteSurveyResponseAsAdmin(getRequestHeaders(), data))

export const getCreatedSurveyResponsesFn = createServerFn({ method: "GET" })
  .validator(GetCreatedSurveyResponsesSchema)
  .handler(({ data }) => getCreatedSurveyResponses(getRequestHeaders(), data))

export const getTestSurveyResponsesFn = createServerFn({ method: "GET" })
  .validator(GetTestSurveyResponsesSchema)
  .handler(({ data }) => getTestSurveyResponses(getRequestHeaders(), data))

export const deleteTestSurveyResponsesFn = createServerFn({ method: "POST" })
  .validator(DeleteTestSurveyResponsesSchema)
  .handler(({ data }) => deleteTestSurveyResponses(getRequestHeaders(), data))
