import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import React from "react"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { useSlugs } from "src/core/hooks"
import getFirstFeedbackSurveyResponseWithLocationId from "src/survey-responses/queries/getFirstFeedbackSurveyResponseWithLocationId"

export const SurveyTabs: React.FC = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")

  const [{ surveyResponse }] = useQuery(getFirstFeedbackSurveyResponseWithLocationId, {
    projectSlug,
    surveyId,
  })

  return (
    <Tabs
      className="mt-7"
      tabs={[
        {
          name: "Auswertung",
          href: Routes.SurveyPage({ projectSlug: projectSlug!, surveyId: surveyId! }),
        },
        {
          name: "Beiträge",
          href: Routes.SurveyResponsePage({
            projectSlug: projectSlug!,
            surveyId: surveyId!,
          }),
        },
        ...(surveyResponse
          ? [
              {
                name: "Beiträge (Karte)",
                href: Routes.SurveyResponseWithLocationPage({
                  projectSlug: projectSlug!,
                  surveyId: surveyId!,
                  surveyResponseId: surveyResponse.id,
                }),
              },
            ]
          : []),
      ]}
    />
  )
}
