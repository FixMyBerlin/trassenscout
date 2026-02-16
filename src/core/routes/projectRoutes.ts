import { Route } from "next"

export const projectDashboardRoute = (projectSlug: string): Route => {
  return `/${projectSlug}` as Route
}

export const projectEditRoute = (projectSlug: string): Route => {
  return `/${projectSlug}/edit` as Route
}
