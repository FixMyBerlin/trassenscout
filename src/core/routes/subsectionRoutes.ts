import { Route } from "next"

export const subsectionDashboardRoute = (projectSlug: string, subsectionSlug: string): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}` as Route
}

export const subsubsectionDashboardRoute = (
  projectSlug: string,
  subsectionSlug: string,
  subsubsectionSlug: string,
): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}` as Route
}
