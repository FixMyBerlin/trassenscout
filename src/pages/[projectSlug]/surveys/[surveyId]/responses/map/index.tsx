import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { Spinner } from "@/src/core/components/Spinner"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H3 } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import EditableSurveyResponseListItem from "@/src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import { SurveyResponseOverviewMap } from "@/src/survey-responses/components/feedback/SurveyResponseOverviewMap"
import { useMapSelection } from "@/src/survey-responses/components/feedback/useMapSelection.nuqs"
import { useResponseDetails } from "@/src/survey-responses/components/feedback/useResponseDetails.nuqs"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { getFlatSurveyQuestions } from "@/src/survey-responses/utils/getQuestionsAsArray"
import { SurveyTabs } from "@/src/surveys/components/SurveyTabs"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { BlitzPage, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { Suspense, useEffect, useRef } from "react"

export const SurveyResponseWithLocation = () => {
  const projectSlug = useProjectSlug()
  const surveyId = useParam("surveyId", "number")
  const [survey] = useQuery(getSurvey, { projectSlug, id: surveyId })
  // the returned responses include the surveyPart1 data
  const [{ feedbackSurveyResponses }, { refetch: refetchResponses }] = useQuery(
    getFeedbackSurveyResponsesWithSurveyDataAndComments,
    {
      projectSlug,
      surveyId: survey.id,
    },
  )
  const { responseDetails } = useResponseDetails()

  const { mapSelection } = useMapSelection(
    feedbackSurveyResponses?.length ? [feedbackSurveyResponses[0]!.id] : [],
  )

  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug,
    },
  )

  // Whenever we submit the form, we also refetch, so the whole accordeon header and everything else is updated
  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  const mapSelectedResponses = mapSelection
    ? feedbackSurveyResponses.filter((response) => mapSelection.includes(response.id))
    : []

  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (responseDetails) {
      const currentRef = accordionRefs.current?.at(responseDetails)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [responseDetails])

  const surveyDefinition = getConfigBySurveySlug(survey.slug, "part1")
  const feedbackDefinition = getConfigBySurveySlug(survey.slug, "part2")
  const metaDefinition = getConfigBySurveySlug(survey.slug, "meta")

  const geometryCategoryId = getQuestionIdBySurveySlug(survey.slug, "geometryCategory")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")

  const mapProps = getFlatSurveyQuestions(feedbackDefinition).find(
    (q) => String(q.name) === String(locationId),
  )!.props
  const maptilerUrl = metaDefinition.maptilerUrl
  // @ts-expect-error
  const defaultViewState = mapProps.mapProps.config.bounds

  if (!feedbackSurveyResponses?.length) return

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

      <div className="space-y-4 px-4">
        {mapSelectedResponses.length > 0 && (
          <>
            <div className="flex justify-end">
              <div className="lg:w-[580px]">
                <H3>
                  Ausgewählte{mapSelectedResponses.length === 1 ? "r" : ""}{" "}
                  {mapSelectedResponses.length === 1 ? "Beitrag" : "Beiträge"}
                </H3>
                <div className="mt-2 flex items-center">
                  <SurveyStaticPin surveySlug={survey.slug} small />
                  <small className="pl-4 text-[#7c3aed]">= Beitrag mit Verortung</small>
                </div>
              </div>
            </div>
          </>
        )}
        <div
          className={clsx(
            // todo survey clean up after survey BB (status are too long, blt are not used)
            survey.slug === "radnetz-brandenburg" && "flex-col",
            "flex w-full max-w-full gap-2 pb-8 lg:flex-row",
          )}
        >
          <section className="h-[1000px] flex-grow">
            <SurveyResponseOverviewMap
              maptilerUrl={maptilerUrl}
              defaultViewState={defaultViewState}
              categoryGeometryRef={geometryCategoryId}
              surveyResponses={feedbackSurveyResponses}
              locationRef={locationId}
              surveySlug={survey.slug}
            />
          </section>
          <section className="rounded-md drop-shadow-md lg:w-[580px]">
            {mapSelectedResponses.map((response) => (
              <div
                key={response.id}
                className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
                // I tried passing the ref as forwardRef but that did not work for unknown reasons.
                // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
                ref={(element) => (accordionRefs.current[response.id] = element)}
              >
                <EditableSurveyResponseListItem
                  isAccordion
                  response={response}
                  operators={operators}
                  topics={topics}
                  refetchResponsesAndTopics={refetchResponsesAndTopics}
                  showMap={false}
                  mapProps={mapProps}
                />
              </div>
            ))}
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
