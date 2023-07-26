import { BlitzPage, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import getSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyNew from "src/surveys/queries/getSurvey"

export const SurveyResponseWithQuery = () => {
  const router = useRouter()
  const surveySlug = useParam("surveySlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [survey] = useQuery(getSurveyNew, { slug: surveySlug })
  const [{ groupedSurveyResponses }] = usePaginatedQuery(getSurveyResponses, {
    surveySlug,
  })

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.slug}`} />
      <PageHeader title={`Beteiligung ${survey.slug}`} className="mt-12" />

      <div className="space-y-4">
        {Object.entries(groupedSurveyResponses).map(([k, v]) => {
          return <GroupedSurveyResponseItem key={k} chartType={"bar"} responseData={{ [k]: v }} />
        })}
      </div>
    </>
  )
}

const SurveyResponsePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponseWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsePage.authenticate = true

export default SurveyResponsePage
