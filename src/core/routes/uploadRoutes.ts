import { Route } from "next"

export const uploadEditRoute = (projectSlug: string, uploadId: number): Route => {
  return `/${projectSlug}/uploads/${uploadId}/edit` as Route
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

export const uploadsListRoute = (projectSlug: string): Route => {
  return `/${projectSlug}/uploads` as Route
}
