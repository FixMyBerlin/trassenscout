import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSurveyResponseTagSchema,
  GetSurveyResponseTagsSchema,
  SurveyResponseTagIdSchema,
  UpdateSurveyResponseTagSchema,
} from "./surveyResponseTags.inputSchemas"
import {
  archiveSurveyResponseTag,
  createSurveyResponseTag,
  deleteSurveyResponseTag,
  getSurveyResponseTagsByProject,
  getSurveyResponseTagsWithUsageCount,
  unarchiveSurveyResponseTag,
  updateSurveyResponseTag,
} from "./surveyResponseTags.server"

export const getSurveyResponseTagsByProjectFn = createServerFn({ method: "GET" })
  .validator(GetSurveyResponseTagsSchema)
  .handler(({ data }) => getSurveyResponseTagsByProject(getRequestHeaders(), data))

export const getSurveyResponseTagsWithUsageCountFn = createServerFn({ method: "GET" })
  .validator(GetSurveyResponseTagsSchema)
  .handler(({ data }) => getSurveyResponseTagsWithUsageCount(getRequestHeaders(), data))

export const createSurveyResponseTagFn = createServerFn({ method: "POST" })
  .validator(CreateSurveyResponseTagSchema)
  .handler(({ data }) => createSurveyResponseTag(getRequestHeaders(), data))

export const updateSurveyResponseTagFn = createServerFn({ method: "POST" })
  .validator(UpdateSurveyResponseTagSchema)
  .handler(({ data }) => updateSurveyResponseTag(getRequestHeaders(), data))

export const archiveSurveyResponseTagFn = createServerFn({ method: "POST" })
  .validator(SurveyResponseTagIdSchema)
  .handler(({ data }) => archiveSurveyResponseTag(getRequestHeaders(), data))

export const unarchiveSurveyResponseTagFn = createServerFn({ method: "POST" })
  .validator(SurveyResponseTagIdSchema)
  .handler(({ data }) => unarchiveSurveyResponseTag(getRequestHeaders(), data))

export const deleteSurveyResponseTagFn = createServerFn({ method: "POST" })
  .validator(SurveyResponseTagIdSchema)
  .handler(({ data }) => deleteSurveyResponseTag(getRequestHeaders(), data))
