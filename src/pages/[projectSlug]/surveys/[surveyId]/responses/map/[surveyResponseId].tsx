import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getSubsections from "src/subsections/queries/getSubsections"
import { TMapProps } from "src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import EditableSurveyResponseListItem from "src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import { SurveyFeedbackWithLocationOverviewMap } from "src/survey-responses/components/feedback/SurveyFeedbackWithLocationOverviewMap"

import getFeedbackResponsesWithLocation from "src/survey-responses/queries/getFeedbackSurveyResponsesWithLocation"
import { SurveyTabs } from "src/surveys/components/SurveyTabs"
import getSurvey from "src/surveys/queries/getSurvey"

export const SurveyResponseWithLocation = () => {
  const { projectSlug, subsectionSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")
  const surveyResponseId = useParam("surveyResponseId", "number")

  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [{ surveyResponsesFeedbackPartWithLocation }] = useQuery(getFeedbackResponsesWithLocation, {
    projectSlug,
    surveyId: survey.id,
  })
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug: projectSlug!,
    },
  )
  const [{ subsections }] = useQuery(getSubsections, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const locationRef = evaluationRefs["feedback-location"]

  const mapProps = feedbackDefinition!.pages[0]!.questions.find((q) => q.id === locationRef)!
    .props as TMapProps

  const maptilerStyleUrl = mapProps.maptilerStyleUrl
  const defaultViewState = mapProps?.config?.bounds

  if (!surveyResponsesFeedbackPartWithLocation?.length) return

  const selectedSurveyResponse = surveyResponsesFeedbackPartWithLocation.find(
    (r) => r.id === surveyResponseId,
  )

  if (!selectedSurveyResponse) return

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader title={survey.title} className="mt-12" description={<SurveyTabs />} />

      <div className="mt-12 space-y-4">
        <H2>Beiträge mit Ortsangabe </H2>

        <div className="flex flex-col lg:flex-row gap-2">
          <section className="lg:w-[46%] shrink-0">
            <SurveyFeedbackWithLocationOverviewMap
              maptilerStyleUrl={maptilerStyleUrl}
              defaultViewState={defaultViewState}
              selectedSurveyResponse={selectedSurveyResponse}
              surveyResponsesFeedbackPartWithLocation={surveyResponsesFeedbackPartWithLocation}
              locationRef={locationRef!}
            />
          </section>
          <section className="rounded-md drop-shadow-md">
            <EditableSurveyResponseListItem
              key={selectedSurveyResponse?.id}
              response={selectedSurveyResponse!}
              operators={operators}
              topics={topics}
              subsections={subsections}
              refetchResponsesAndTopics={refetchTopics}
            />
          </section>
        </div>
      </div>
    </>
  )
}

const SurveyResponseWithLocationPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponseWithLocation />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponseWithLocationPage.authenticate = true

export default SurveyResponseWithLocationPage