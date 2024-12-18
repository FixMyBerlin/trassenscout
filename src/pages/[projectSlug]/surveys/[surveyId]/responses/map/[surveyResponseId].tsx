import { Spinner } from "@/src/core/components/Spinner"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { TMapProps } from "@/src/survey-public/components/types"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import EditableSurveyResponseListItem from "@/src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import { SurveyFeedbackWithLocationOverviewMap } from "@/src/survey-responses/components/feedback/SurveyFeedbackWithLocationOverviewMap"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { SurveyTabs } from "@/src/surveys/components/SurveyTabs"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { Suspense } from "react"

export const SurveyResponseWithLocation = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "number")
  const surveyResponseId = useParam("surveyResponseId", "number")

  const [survey] = useQuery(getSurvey, { projectSlug, id: surveyId })
  // the returned responses include the surveyPart1 data
  const [{ feedbackSurveyResponses }] = useQuery(
    getFeedbackSurveyResponsesWithSurveyDataAndComments,
    {
      projectSlug,
      surveyId: survey.id,
      withLocationOnly: true,
    },
  )
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug,
    },
  )
  const [{ subsections }] = useQuery(getSubsections, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)

  const locationRef = evaluationRefs["feedback-location"]

  const mapProps = feedbackDefinition!.pages[1]!.questions.find((q) => q.id === locationRef)!
    .props as TMapProps
  const maptilerUrl = surveyDefinition.maptilerUrl
  const defaultViewState = mapProps?.config?.bounds

  if (!feedbackSurveyResponses?.length) return

  const selectedSurveyResponse = feedbackSurveyResponses.find((r) => r.id === surveyResponseId)

  if (!selectedSurveyResponse) return

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <div className="flex items-center justify-center px-6">
        <PageHeader
          title={survey.title}
          className="mt-12 w-full max-w-7xl"
          description={<SurveyTabs />}
        />
      </div>

      <div className="mt-12 space-y-4 px-4">
        <div
          className={clsx(
            // todo survey clean up after survey BB (status are too long, blt are not used)
            survey.slug === "radnetz-brandenburg" && "flex-col",
            "flex w-full max-w-full gap-2 lg:flex-row",
          )}
        >
          <section className="h-[1000px] flex-grow">
            <SurveyFeedbackWithLocationOverviewMap
              maptilerUrl={maptilerUrl}
              defaultViewState={defaultViewState}
              selectedSurveyResponse={selectedSurveyResponse}
              surveyResponsesFeedbackPartWithLocation={feedbackSurveyResponses}
              locationRef={locationRef!}
              surveySlug={survey.slug}
            />
          </section>
          <section className="rounded-md drop-shadow-md lg:w-[580px]">
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
    <LayoutRs fullWidth>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponseWithLocation />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponseWithLocationPage.authenticate = true

export default SurveyResponseWithLocationPage
