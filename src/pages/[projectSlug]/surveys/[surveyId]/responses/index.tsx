import { BlitzPage, useParam, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense, useEffect, useRef } from "react"
import { Spinner } from "src/core/components/Spinner"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getSubsections from "src/subsections/queries/getSubsections"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { EditableSurveyResponseFilterForm } from "src/survey-responses/components/feedback/EditableSurveyResponseFilterForm"
import EditableSurveyResponseListItem from "src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import { ExternalSurveyResponseFormModal } from "src/survey-responses/components/feedback/ExternalSurveyResponseFormModal"
import { useFilteredResponses } from "src/survey-responses/components/feedback/useFilteredResponses"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"
import { SurveyTabs } from "src/surveys/components/SurveyTabs"
import getSurvey from "src/surveys/queries/getSurvey"

export const SurveyResponse = () => {
  const { projectSlug, subsectionSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")

  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [feedbackSurveyResponses, { refetch: refetchResponses }] = useQuery(
    getFeedbackSurveyResponses,
    { projectSlug, surveyId: survey.id },
  )
  const filteredResponses = useFilteredResponses(feedbackSurveyResponses, survey.slug)
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    { projectSlug: projectSlug! },
  )

  // Whenever we submit the form, we also refetch, so the whole accordeon header and everything else is updated
  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  const [{ subsections }] = useQuery(getSubsections, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  // Handle scroll into view on page load (like a hash URL) based on a ref and URL param `stakeholderDetails`.
  // The ref is an error of listItems where the array index is the stakeholderNote.id.
  const params = useRouterQuery()
  const paramsStakeholderDetails = parseInt(String(params.responseDetails))
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (paramsStakeholderDetails) {
      const currentRef = accordionRefs.current?.at(paramsStakeholderDetails)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [paramsStakeholderDetails])

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader title={survey.title} className="mt-12" description={<SurveyTabs />} />

      <div className="space-y-4 mt-12">
        <H2>Beiträge aus Bürgerbeteiligung </H2>

        <ExternalSurveyResponseFormModal refetch={refetchResponses} />

        <EditableSurveyResponseFilterForm operators={operators} topics={topics} />

        <ZeroCase visible={filteredResponses.length} name={"Beiträge"} />
        {filteredResponses.length === 1 ? (
          <p>1 Beitrag</p>
        ) : (
          <p>{filteredResponses.length} Beiträge</p>
        )}
        <section>
          {filteredResponses.map((response) => (
            <div
              key={response.id}
              className="w-full text-sm first:rounded-t-xl border border-gray-300 border-b-0 last:border-b last:rounded-b-xl overflow-hidden"
              // I tried passing the ref as forwardRef but that did not work for unknown reasons.
              ref={(element) => (accordionRefs.current[response.id] = element)}
            >
              <EditableSurveyResponseListItem
                response={response}
                operators={operators}
                topics={topics}
                subsections={subsections}
                refetchResponsesAndTopics={refetchResponsesAndTopics}
              />
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

const SurveyResponsePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <SurveyResponse />
      </Suspense>
    </LayoutRs>
  )
}

SurveyResponsePage.authenticate = true

export default SurveyResponsePage
