import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { Spinner } from "src/core/components/Spinner"
import getSurveys from "src/surveys/queries/getSurveys"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import { useSlugs } from "src/core/hooks"

export const SurveysList = () => {
  const { projectSlug } = useSlugs()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ surveys, hasMore }] = usePaginatedQuery(getSurveys, {
    projectSlug: projectSlug!,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Surveys</h1>

      <p>
        <Link
          href={Routes.NewSurveyPage({
            projectSlug: projectSlug!,
          })}
        >
          Survey erstellen
        </Link>
      </p>

      <ul>
        {surveys.map((survey) => (
          <li key={survey.id}>
            <Link href={Routes.ShowSurveyPage({ projectSlug: projectSlug!, surveyId: survey.id })}>
              {survey.slug}
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const SurveysPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Surveys" />

      <Suspense fallback={<Spinner page />}>
        <SurveysList />
      </Suspense>
    </LayoutRs>
  )
}

SurveysPage.authenticate = { role: "ADMIN" }

export default SurveysPage
