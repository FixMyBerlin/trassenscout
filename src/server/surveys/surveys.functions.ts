import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateAdminSurveySchema,
  CreateSurveyBySlugSchema,
  DeleteAdminSurveySchema,
  DeleteSurveySchema,
  GetAdminSurveySchema,
  GetAdminSurveysSchema,
  GetSurveySchema,
  GetSurveysSchema,
  UpdateAdminSurveySchema,
  UpdateSurveyBySlugSchema,
} from "./surveys.inputSchemas"
import {
  createAdminSurvey,
  createSurvey,
  deleteAdminSurvey,
  deleteSurvey,
  getAdminSurvey,
  getAdminSurveys,
  getSurvey,
  getSurveys,
  updateAdminSurvey,
  updateSurvey,
} from "./surveys.server"
export const getSurveysFn = createServerFn({ method: "GET" })
  .validator(GetSurveysSchema)
  .handler(({ data }) => getSurveys(getRequestHeaders(), data))

export const getSurveyFn = createServerFn({ method: "GET" })
  .validator(GetSurveySchema)
  .handler(({ data }) => getSurvey(getRequestHeaders(), data))

const _createSurveyFn = createServerFn({ method: "POST" })
  .validator(CreateSurveyBySlugSchema)
  .handler(({ data }) => createSurvey(getRequestHeaders(), data))

const _updateSurveyFn = createServerFn({ method: "POST" })
  .validator(UpdateSurveyBySlugSchema)
  .handler(({ data }) => updateSurvey(getRequestHeaders(), data))

const _deleteSurveyFn = createServerFn({ method: "POST" })
  .validator(DeleteSurveySchema)
  .handler(({ data }) => deleteSurvey(getRequestHeaders(), data))

export const getAdminSurveysFn = createServerFn({ method: "GET" })
  .validator(GetAdminSurveysSchema)
  .handler(() => getAdminSurveys(getRequestHeaders()))

export const getAdminSurveyFn = createServerFn({ method: "GET" })
  .validator(GetAdminSurveySchema)
  .handler(({ data }) => getAdminSurvey(getRequestHeaders(), data))

export const createAdminSurveyFn = createServerFn({ method: "POST" })
  .validator(CreateAdminSurveySchema)
  .handler(({ data }) => createAdminSurvey(getRequestHeaders(), data))

export const updateAdminSurveyFn = createServerFn({ method: "POST" })
  .validator(UpdateAdminSurveySchema)
  .handler(({ data }) => updateAdminSurvey(getRequestHeaders(), data))

export const deleteAdminSurveyFn = createServerFn({ method: "POST" })
  .validator(DeleteAdminSurveySchema)
  .handler(({ data }) => deleteAdminSurvey(getRequestHeaders(), data))
