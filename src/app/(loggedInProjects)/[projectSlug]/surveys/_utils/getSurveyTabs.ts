import { invoke } from "@/src/blitz-server"
import getFirstFeedbackSurveyResponseWithLocationId from "@/src/server/survey-responses/queries/getFirstPart2SurveyResponseWithLocationId"
import { Route } from "next"
import "server-only"
import { surveyHref, surveyResponsesHref, surveyResponsesMapHref } from "./SurveyHrefs"

/**
 * Creates the tabs configuration for survey pages.
 * @param projectSlug - The project slug
 * @param surveyId - The survey ID
 * @returns Array of tab configurations
 */
export async function getSurveyTabs(projectSlug: string, surveyId: number) {
  const { surveyResponse } = await invoke(getFirstFeedbackSurveyResponseWithLocationId, {
    projectSlug,
    surveyId,
  })

  return [
    {
      name: "Beiträge",
      href: surveyResponsesHref(projectSlug, surveyId) as Route,
    },
    ...(surveyResponse
      ? [
          {
            name: "Beiträge (Karte)",
            href: surveyResponsesMapHref(projectSlug, surveyId) as Route,
          },
        ]
      : []),
    {
      name: "Auswertung",
      href: surveyHref(projectSlug, surveyId) as Route,
    },
  ]
}
