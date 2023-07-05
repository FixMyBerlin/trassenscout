import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { Spinner } from "src/core/components/Spinner"
import getSurveys from "src/surveys/queries/getSurveys"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import ShowSurveyPage from "./[surveyId]"

const ITEMS_PER_PAGE = 100

export const SurveysList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ surveys, hasMore }] = usePaginatedQuery(getSurveys, {
    // orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Surveys</h1>

      <p>
        <Link href={Routes.NewSurveyPage()}>Survey erstellen</Link>
      </p>

      <ul>
        {surveys.map((survey) => (
          <li key={survey.id}>
            <Link href={Routes.ShowSurveyPage({ surveyId: survey.id })}>{survey.slug}</Link>
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
    <LayoutArticle>
      <MetaTags noindex title="Surveys" />

      <Suspense fallback={<Spinner page />}>
        <SurveysList />
      </Suspense>
    </LayoutArticle>
  )
}

SurveysPage.authenticate = { role: "ADMIN" }

export default SurveysPage
