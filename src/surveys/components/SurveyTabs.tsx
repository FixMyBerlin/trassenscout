import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getFirstFeedbackSurveyResponseWithLocationId from "@/src/survey-responses/queries/getFirstFeedbackSurveyResponseWithLocationId"
import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"

export const SurveyTabs = () => {
  const projectSlug = useProjectSlug()
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
          href: Routes.SurveyPage({ projectSlug, surveyId: surveyId! }),
        },
        {
          name: "Beiträge",
          href: Routes.SurveyResponsePage({
            projectSlug,
            surveyId: surveyId!,
          }),
        },
        ...(surveyResponse
          ? [
              {
                name: "Beiträge (Karte)",
                href: Routes.SurveyResponseWithLocationPage({
                  projectSlug,
                  surveyId: surveyId!,
                }),
              },
            ]
          : []),
      ]}
    />
  )
}
