import { Route } from "next"

export const projectRecordDetailRoute = (projectSlug: string, projectRecordId: number): Route => {
  return `/${projectSlug}/project-records/${projectRecordId}` as Route
}

export const projectRecordEditRoute = (projectSlug: string, projectRecordId: number): Route => {
  return `/${projectSlug}/project-records/${projectRecordId}/edit` as Route
}

export const projectRecordDeleteRoute = (projectSlug: string, projectRecordId: number): Route => {
  return `/${projectSlug}/project-records/${projectRecordId}/delete` as Route
}
