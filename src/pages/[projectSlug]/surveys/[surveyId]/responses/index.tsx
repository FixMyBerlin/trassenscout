import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H2 } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlugId } from "@/src/core/routes/useSlug"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { getBackendConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { EditableSurveyResponseFilterForm } from "@/src/survey-responses/components/feedback/EditableSurveyResponseFilterForm"
import EditableSurveyResponseListItem from "@/src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import { ExternalSurveyResponseFormModal } from "@/src/survey-responses/components/feedback/ExternalSurveyResponseFormModal"
import { useFilteredResponses } from "@/src/survey-responses/components/feedback/useFilteredResponses"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { SurveyTabs } from "@/src/surveys/components/SurveyTabs"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { BlitzPage, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { Suspense, useEffect, useRef } from "react"

export const SurveyResponse = () => {
  const projectSlug = useProjectSlug()
  const surveyId = useSlugId("surveyId")
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const backenendConfig = getBackendConfigBySurveySlug(survey.slug)
  // the returned responses include the surveyPart1 data
  const [
    { feedbackSurveyResponses, additionalFilterQuestionsWithResponseOptions },
    { refetch: refetchResponses },
  ] = useQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments, {
    projectSlug,
    surveyId: survey.id,
  })
  const filteredResponses = useFilteredResponses(feedbackSurveyResponses, survey.slug)
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    { projectSlug },
  )

  // Whenever we submit the form, we also refetch, so the whole accordeon header and everything else is updated
  const refetchResponsesAndTopics = async () => {
    await refetchTopics()
    await refetchResponses()
  }

  // Handle scroll into view on page load (like a hash URL) based on a ref and URL param `stakeholderDetails`.
  // The ref is an error of listItems where the array index is the stakeholderNote.id.
  const params = useRouterQuery()
  const paramsSurveyResponseId = parseInt(String(params.responseDetails))
  const accordionRefs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (paramsSurveyResponseId) {
      const currentRef = accordionRefs.current?.at(paramsSurveyResponseId)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [paramsSurveyResponseId])

  return (
    <>
      <MetaTags noindex title={`Beteiligung ${survey.title}`} />
      <PageHeader title={survey.title} className="mt-12" description={<SurveyTabs />} />

      <div className="mt-12 space-y-4">
        <H2>Beiträge aus Bürger:innenbeteiligung</H2>
        <div className="mb-6">
          <Link
            className="mb-12 flex gap-1"
            href={`/api/survey/${projectSlug}/${survey.id}/feedback/results`}
          >
            <ArrowDownTrayIcon className="mr-1 h-5 w-5" />
            Alle Daten als .csv herunterladen
          </Link>
        </div>

        {!backenendConfig.disableExternalSurveyResponseForm && (
          <ExternalSurveyResponseFormModal refetch={refetchResponses} />
        )}
        <EditableSurveyResponseFilterForm
          additionalFilters={additionalFilterQuestionsWithResponseOptions}
          operators={operators}
          topicsDefinition={topics}
        />

        <ZeroCase visible={filteredResponses.length} name={"Beiträge"} />
        {filteredResponses.length === 1 ? (
          <p>1 Beitrag</p>
        ) : (
          <p>{filteredResponses.length} Beiträge</p>
        )}
        {filteredResponses.length !== 0 && (
          <div className="mt-2 flex items-center">
            <SurveyStaticPin surveySlug={survey.slug} small />
            <small className="pl-4 text-[#7c3aed]">= Beitrag mit Verortung</small>
          </div>
        )}
        <section>
          {filteredResponses.map((response) => (
            <div
              key={response.id}
              className="w-full overflow-hidden border border-b-0 border-gray-300 text-sm first:rounded-t-xl last:rounded-b-xl last:border-b"
              // I tried passing the ref as forwardRef but that did not work for unknown reasons.
              // @ts-expect-error TODO: this erros since we updated packages; we need to re-test this and maybe remove the feature?
              ref={(element) => (accordionRefs.current[response.id] = element)}
            >
              <EditableSurveyResponseListItem
                showMap
                isAccordion
                response={response}
                operators={operators}
                topics={topics}
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
