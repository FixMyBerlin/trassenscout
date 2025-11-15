import { Route } from "next"

export const uploadEditRoute = (projectSlug: string, uploadId: number): Route => {
  return `/${projectSlug}/uploads/${uploadId}/edit` as Route
}

export const subsubsectionUploadEditRoute = (
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
  uploadId: number,
): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}/uploads/${uploadId}/edit` as Route
}

export const projectRecordUploadEditRoute = (
  projectSlug: string,
  projectRecordId: number,
  uploadId: number,
): Route => {
  return `/${projectSlug}/project-records/${projectRecordId}/uploads/${uploadId}/edit` as Route
}

export const uploadDetailRoute = (projectSlug: string, uploadId: number): Route => {
  return `/${projectSlug}/uploads/${uploadId}` as Route
}

export const uploadsListRoute = (projectSlug: string): Route => {
  return `/${projectSlug}/uploads` as Route
}
