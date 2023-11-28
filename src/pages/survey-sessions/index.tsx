import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { SurveyResponse } from "db"
import { useRouter } from "next/router"
import { Suspense } from "react"

import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { feedbackDefinition } from "src/participation/data/feedback"
import { surveyDefinition } from "src/participation/data/survey"
import getSurveySessionsWithResponses from "src/survey-sessions/queries/getSurveySessionsWithResponses"

const surveys = Object.fromEntries([surveyDefinition, feedbackDefinition].map((o) => [o.part, o]))
const questions = {}
Object.values(surveys).forEach((survey) => {
  survey.pages.forEach((page) => {
    if (!page.questions) return
    page.questions.forEach((question) => {
      // @ts-ignore
      if (["singleResponse", "multipleResponse"].includes(question.component)) {
        // @ts-ignore
        question.responses = Object.fromEntries(question.props.responses.map((r) => [r.id, r]))
      }
      // @ts-ignore
      questions[question.id] = question
    })
  })
})

const ITEMS_PER_PAGE = 10

export const SurveySessionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ surveySessions, hasMore, count }] = usePaginatedQuery(getSurveySessionsWithResponses, {
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>SurveySessions {count}</h1>

      <ul>
        {surveySessions
          // TODO remove filter to show all sessions
          // iterate through all surveys - does not work with this code as questions differ in feedback and surveydefinition
          .filter((session) => session.surveyId === 1)
          .map((surveySession) => {
            const { id, createdAt, responses } = surveySession
            return (
              <li key={id} className="border-2 p-2">
                <Link href={Routes.ShowSurveySessionPage({ surveySessionId: id })}>
                  <code className="text-base">
                    SurveySession {id} - {createdAt.toISOString()}
                  </code>
                </Link>

                <div>
                  <code>
                    {responses.map(({ id, surveyPart, data }: SurveyResponse) => {
                      const survey = surveys[surveyPart]

                      data = JSON.parse(data) as any // TODO are there types somewhere for {[questionId]: responseData} ?
                      return (
                        <code key={id}>
                          <div className="ml-3">
                            {Object.entries(data).map(([questionId, responseData]) => {
                              // @ts-ignore
                              const question = questions[questionId]
                              console.log(questions)

                              return (
                                <div key={question.id} className="ml-3">
                                  <span className="">
                                    [{question.id}] {question.label.de}
                                  </span>{" "}
                                  =&nbsp;
                                  {(() => {
                                    if (question.component === "singleResponse") {
                                      // @ts-ignore
                                      const responseId = responseData as number | null
                                      return responseId === null
                                        ? "null"
                                        : `[${responseId}] ${question.responses[responseId].text.de}`
                                    }
                                    if (question.component === "multipleResponse") {
                                      // @ts-ignore
                                      const responseIds = responseData as number[]
                                      return responseIds
                                        .map(
                                          (responseId) =>
                                            `[${responseId}] ${question.responses[responseId].text.de}`,
                                        )
                                        .join(", ")
                                    }
                                    if (question.component === "text") {
                                      // @ts-ignore
                                      const responseText = responseData as string | null
                                      return JSON.stringify(responseText)
                                    }
                                    return JSON.stringify(responseData)
                                  })()}
                                </div>
                              )
                            })}
                          </div>
                        </code>
                      )
                    })}
                  </code>
                </div>
              </li>
            )
          })}
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

const SurveySessionsPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="SurveySessions" />

      <Suspense fallback={<Spinner page />}>
        <SurveySessionsList />
      </Suspense>
    </LayoutArticle>
  )
}

SurveySessionsPage.authenticate = { role: "ADMIN" }

export default SurveySessionsPage
