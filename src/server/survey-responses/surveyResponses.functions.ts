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
  deleteSurveyResponse,
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
  .inputValidator(GetSurveyResponsesSchema)
  .handler(({ data }) => getSurveyResponses(getRequestHeaders(), data))

const _getSurveyResponseFn = createServerFn({ method: "GET" })
  .inputValidator(GetSurveyResponseSchema)
  .handler(({ data }) => getSurveyResponse(getRequestHeaders(), data))

export const getFeedbackSurveyResponsesWithSurveyDataAndCommentsFn = createServerFn({
  method: "GET",
})
  .inputValidator(GetFeedbackSurveyResponsesSchema)
  .handler(({ data }) =>
    getFeedbackSurveyResponsesWithSurveyDataAndComments(getRequestHeaders(), data),
  )

export const getGroupedSurveyResponsesFn = createServerFn({ method: "GET" })
  .inputValidator(GetGroupedSurveyResponsesSchema)
  .handler(({ data }) => getGroupedSurveyResponses(getRequestHeaders(), data))

export const getLinkedSurveyResponseForSubsubsectionFn = createServerFn({ method: "GET" })
  .inputValidator(GetLinkedSurveyResponseForSubsubsectionSchema)
  .handler(({ data }) => getLinkedSurveyResponseForSubsubsection(getRequestHeaders(), data))

const _createSurveyResponseFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSurveyResponseBySlugSchema)
  .handler(({ data }) => createSurveyResponse(getRequestHeaders(), data))

const _updateSurveyResponseFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateSurveyResponseBySlugSchema)
  .handler(({ data }) => updateSurveyResponse(getRequestHeaders(), data))

export const patchSurveyResponseFn = createServerFn({ method: "POST" })
  .inputValidator(PatchSurveyResponseSchema)
  .handler(({ data }) => patchSurveyResponse(getRequestHeaders(), data))

export const deleteSurveyResponseFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteSurveyResponseBySlugSchema)
  .handler(({ data }) => deleteSurveyResponse(getRequestHeaders(), data))

export const getCreatedSurveyResponsesFn = createServerFn({ method: "GET" })
  .inputValidator(GetCreatedSurveyResponsesSchema)
  .handler(({ data }) => getCreatedSurveyResponses(getRequestHeaders(), data))

export const getTestSurveyResponsesFn = createServerFn({ method: "GET" })
  .inputValidator(GetTestSurveyResponsesSchema)
  .handler(({ data }) => getTestSurveyResponses(getRequestHeaders(), data))

export const deleteTestSurveyResponsesFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteTestSurveyResponsesSchema)
  .handler(({ data }) => deleteTestSurveyResponses(getRequestHeaders(), data))
