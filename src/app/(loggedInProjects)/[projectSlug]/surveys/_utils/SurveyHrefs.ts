import type { Route } from "next"

/**
 * Builds hrefs for survey-related pages.
 * All hrefs are explicit strings (no Routes.* usage).
 */

export function surveysHref(projectSlug: string): Route {
  return `/${projectSlug}/surveys` as Route
}

export function surveyHref(projectSlug: string, surveyId: number): Route {
  return `/${projectSlug}/surveys/${surveyId}` as Route
}

type SurveyResponsesHrefOptions = {
  responseDetails?: number
}

export function surveyResponsesHref(
  projectSlug: string,
  surveyId: number,
  opts?: SurveyResponsesHrefOptions,
): Route {
  const base = `/${projectSlug}/surveys/${surveyId}/responses`
  if (opts?.responseDetails) {
    return `${base}?responseDetails=${opts.responseDetails}` as Route
  }
  return base as Route
}

type SurveyResponsesMapHrefOptions = {
  responseDetails?: number
  selectedResponses?: number[]
}

export function surveyResponsesMapHref(
  projectSlug: string,
  surveyId: number,
  opts?: SurveyResponsesMapHrefOptions,
): Route {
  const base = `/${projectSlug}/surveys/${surveyId}/responses/map`
  const params = new URLSearchParams()
  if (opts?.responseDetails) {
    params.set("responseDetails", String(opts.responseDetails))
  }
  if (opts?.selectedResponses && opts.selectedResponses.length > 0) {
    params.set("selectedResponses", opts.selectedResponses.join(","))
  }
  const queryString = params.toString()
  return (queryString ? `${base}?${queryString}` : base) as Route
}
