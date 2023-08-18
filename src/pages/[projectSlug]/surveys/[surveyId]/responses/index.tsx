import { BlitzPage, useParam, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import { Suspense, useEffect, useRef, useState } from "react"
import { Spinner } from "src/core/components/Spinner"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { H2 } from "src/core/components/text"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import surveyDefinition from "src/participation/data/survey.json"
import getSubsections from "src/subsections/queries/getSubsections"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import { EditableSurveyResponseFilterForm } from "src/survey-responses/components/feedback/EditableSurveyResponseFilterForm"
import EditableSurveyResponseListItem from "src/survey-responses/components/feedback/EditableSurveyResponseListItem"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"
import { SurveyTabs } from "src/surveys/components/SurveyTabs"
import getSurvey from "src/surveys/queries/getSurvey"

// WIP
export type TFilter = {
  operatorFilter: null | "1" | "2" | "3" | "4"
  statusFilter: ("PENDING" | "ASSIGNED" | "DONE_PLANING" | "DONE_FAQ" | "IRRELEVANT")[] | false
  topicFilter: number[] | false
  isNoteFilter: boolean
}

export const SurveyResponse = () => {
  const { projectSlug, subsectionSlug } = useSlugs()
  const surveyId = useParam("surveyId", "number")

  const [survey] = useQuery(getSurvey, { id: surveyId })
  const [feedbackSurveyResponses, { refetch: refetchResponses }] = useQuery(
    getFeedbackSurveyResponses,
    {
      projectSlug,
      surveyId: survey.id,
    },
  )
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ surveyResponseTopics: topics }, { refetch: refetchTopics }] = useQuery(
    getSurveyResponseTopicsByProject,
    {
      projectSlug: projectSlug!,
    },
  )

  const [filter, setFilter] = useState<TFilter>({
    operatorFilter: null,
    statusFilter: false,
    topicFilter: false,
    isNoteFilter: false,
  })

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
      <PageHeader
        title={survey.title}
        className="mt-12"
        description={
          <>
            <SurveyTabs />
            <p className="mt-5 text-base text-gray-500">
              Dieser Bereich sammelt die Ergebnisse und Berichte der Beteiligung. Hier finden sie
              die Excel Tabelle und ausgewählte Auswertungsergebnisse.
            </p>
            {survey.active && surveyDefinition.canonicalUrl && (
              <p className="text-base text-gray-500">
                Die Beteiligung ist über{" "}
                <Link blank className="!text-base" href={surveyDefinition.canonicalUrl}>
                  diese Seite
                  <ArrowTopRightOnSquareIcon className="ml-1 w-4 h-4 inline-flex mb-1" />
                </Link>{" "}
                erreichbar.
              </p>
            )}
          </>
        }
      />

      <div className="space-y-4 mt-12">
        <H2>Kommentare aus Bürgerbeteiligung ({feedbackSurveyResponses.length})</H2>

        <div>
          <div className="border rounded border-pink-300 p-2 mb-4">
            <code>{JSON.stringify(filter)}</code>
          </div>

          <small>Filtern nach:</small>
          <EditableSurveyResponseFilterForm
            operators={operators}
            topics={topics}
            filter={filter}
            setFilter={setFilter}
          />
        </div>

        <ZeroCase visible={feedbackSurveyResponses.length} name={"Beiträge"} />

        <section>
          {feedbackSurveyResponses.map((response) => (
            <div
              key={response.id}
              className="w-full text-sm first:rounded-t-xl border border-gray-200 border-b-0 last:border-b last:rounded-b-xl overflow-hidden"
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
