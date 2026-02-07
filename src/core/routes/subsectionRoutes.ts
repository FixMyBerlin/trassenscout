import { Route } from "next"

export const subsectionDashboardRoute = (projectSlug: string, subsectionSlug: string): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}` as Route
}

export const subsectionEditRoute = (projectSlug: string, subsectionSlug: string): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/edit` as Route
}

export const subsectionNewRoute = (projectSlug: string): Route => {
  return `/${projectSlug}/abschnitte/new` as Route
}

export const subsubsectionDashboardRoute = (
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}` as Route
}

export const subsubsectionEditRoute = (
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}/edit` as Route
}

export const subsubsectionNewRoute = (projectSlug: string, subsectionSlug: string): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/new` as Route
}
