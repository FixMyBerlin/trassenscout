import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { useProjectSlug } from "@/src/core/hooks"
import getFirstFeedbackSurveyResponseWithLocationId from "@/src/survey-responses/queries/getFirstFeedbackSurveyResponseWithLocationId"
import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"

export const SurveyTabs: React.FC = () => {
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
