import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import SurveyResultDisplayWithOverviewAndCharts from "src/surveys/components/SurveyResultDisplayWithOverviewAndCharts"
import getSurveysByProjectSlug from "src/surveys/queries/getSurveysByProjectSlug"

export const SurveyResponsesWithQuery = () => {
  const { projectSlug } = useSlugs()
  const [{ surveys }] = usePaginatedQuery(getSurveysByProjectSlug, {
    projectSlug: projectSlug!,
  })

  if (!surveys.length) {
    return <ZeroCase visible={0} name="Kontakte" />
  }

  return (
    <>
      <PageHeader
        title="Beteiligungen"
        description="Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligungen. Hier finden sie die Excel Tabelle und ausgewählte
            Auswertungsergebnisse."
        className="mt-12"
      />
      <div className="flex flex-col gap-4">
        {surveys.map((survey) => (
          <SurveyResultDisplayWithOverviewAndCharts surveySlug={survey.slug} key={survey.id} />
        ))}
      </div>
    </>
  )
}

const SurveyResponsesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Beteiligungen" />

      <Suspense fallback={<Spinner page />}>
        <SurveyResponsesWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsesPage.authenticate = true

export default SurveyResponsesPage
