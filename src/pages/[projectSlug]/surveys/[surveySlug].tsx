import { BlitzPage, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import GroupedSurveyResponseItem from "src/survey-responses/components/GroupedSurveyResponseItem"
import GetGroupedSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyResponses from "src/survey-responses/queries/getGroupedSurveyResponses"
import getSurveyNew from "src/surveys/queries/getSurvey"

export const SurveyResponseWithQuery = () => {
  const router = useRouter()
  const surveySlug = useParam("surveySlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [survey] = useQuery(getSurveyNew, { slug: surveySlug })
  const [{ surveyResponses, groupedSurveyResponses }] = usePaginatedQuery(getSurveyResponses, {
    surveySlug,
  })

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.slug}`} />
      <PageHeader title={`Beteiligung ${survey.slug}`} className="mt-12" />

      <div>
        <pre>{JSON.stringify(groupedSurveyResponses, null, 2)}</pre>
        <GroupedSurveyResponseItem
          responseData={{
            "1": {
              "1": 71,
              "2": 16,
              "3": 13,
            },
          }}
        />
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
