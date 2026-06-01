import {
  appendQueryParamIfMissing,
  buildRouteWithQuery,
  RETURN_PROJECT_RECORD_ID_PARAM,
  RETURN_TO_PARAM,
  ReturnToOptions,
} from "@/src/core/routes/returnTo"
import { Route } from "next"

type UploadEditRouteOptions = ReturnToOptions & {
  returnProjectRecordId?: number
}

export const uploadEditRoute = (
  projectSlug: string,
  uploadId: number,
  options?: UploadEditRouteOptions,
): Route => {
  const pathname = `/${projectSlug}/uploads/${uploadId}/edit`

  return buildRouteWithQuery(pathname, {
    [RETURN_PROJECT_RECORD_ID_PARAM]: options?.returnProjectRecordId,
    [RETURN_TO_PARAM]: options?.returnTo,
  })
}

export const uploadEditRouteForProjectRecord = (
  projectSlug: string,
  uploadId: number,
  projectRecordId: number,
  options?: Pick<UploadEditRouteOptions, "returnTo">,
): Route => {
  return uploadEditRoute(projectSlug, uploadId, {
    returnProjectRecordId: projectRecordId,
    returnTo: options?.returnTo,
  })
}

export const appendReturnToToUploadEditRoute = (editRoute: Route, returnTo?: string): Route => {
  return appendQueryParamIfMissing(editRoute, RETURN_TO_PARAM, returnTo)
}

export const surveyResponseUploadEditRoute = (
  projectSlug: string,
  surveyId: number,
  surveyResponseId: number,
  uploadId: number,
): Route => {
  return `/${projectSlug}/surveys/${surveyId}/responses/${surveyResponseId}/uploads/${uploadId}/edit` as Route
}

export const uploadDetailRoute = (projectSlug: string, uploadId: number): Route => {
  return `/${projectSlug}/uploads/${uploadId}` as Route
}

export const uploadViewRoute = (projectSlug: string, uploadId: number): Route => {
  return `/${projectSlug}/uploads/${uploadId}/view` as Route
}

export const uploadsListRoute = (projectSlug: string): Route => {
  return `/${projectSlug}/uploads` as Route
}
