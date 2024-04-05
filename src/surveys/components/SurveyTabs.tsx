import { Routes, useParam } from "@blitzjs/next"
import React from "react"
import { Tabs } from "src/core/components/Tabs/Tabs"
import { useSlugs } from "src/core/hooks"

export const SurveyTabs: React.FC = () => {
  const { projectSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")

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
      ]}
    />
  )
}
