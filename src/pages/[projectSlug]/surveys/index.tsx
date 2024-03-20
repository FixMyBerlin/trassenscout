import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSurveys from "src/surveys/queries/getSurveys"

export const Surveys = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [{ surveys }] = usePaginatedQuery(getSurveys, { projectSlug: projectSlug! })

  if (!surveys.length) {
    return <ZeroCase visible={0} name="Beteiligungen" />
  }

  // Navigation always links to /survey. But this redirects to the survey Page when only one is present.
  if (surveys.length === 1) {
    void router.push(Routes.SurveyPage({ projectSlug: projectSlug!, surveyId: surveys[0]!.id }))
    return <Spinner page />
  }

  return (
    <>
      <PageHeader
        title="Beteiligungen"
        description="Dieser Bereich sammelt die Ergebnisse der Umfragen und Beteiligungen."
        className="mt-12"
      />
      <div className="flex flex-col gap-4">
        {surveys.map((survey) => (
          <Link
            key={survey.id}
            href={Routes.SurveyPage({ projectSlug: projectSlug!, surveyId: survey.id })}
          >
            {survey.title}
          </Link>
        ))}
      </div>
    </>
  )
}

const SurveysPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Beteiligungen" />

      <Suspense fallback={<Spinner page />}>
        <Surveys />
      </Suspense>
    </LayoutRs>
  )
}

SurveysPage.authenticate = true

export default SurveysPage
