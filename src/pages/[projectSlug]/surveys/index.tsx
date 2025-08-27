import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import getSurveys from "@/src/surveys/queries/getSurveys"
import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const Surveys = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [{ surveys }] = usePaginatedQuery(getSurveys, { projectSlug })

  if (!surveys.length) {
    return <ZeroCase visible={0} name="Beteiligungen" />
  }

  // Navigation always links to /survey. But this redirects to the survey Page when only one is present.
  if (surveys.length === 1) {
    void router.push(Routes.SurveyPage({ projectSlug, surveyId: surveys[0]!.id }))
    return <Spinner page />
  }

  return (
    <>
      <PageHeader title="Beteiligungen" className="mt-12" />
      <div className="flex flex-col gap-4">
        {surveys.map((survey) => (
          <Link key={survey.id} href={Routes.SurveyPage({ projectSlug, surveyId: survey.id })}>
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
