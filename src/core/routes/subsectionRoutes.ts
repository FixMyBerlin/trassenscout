import { Route } from "next"

export const subsectionDashboardRoute = (projectSlug: string, subsectionSlug: string): Route => {
  return `/${projectSlug}/abschnitte/${subsectionSlug}` as Route
}
