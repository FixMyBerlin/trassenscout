import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { TMapProps } from "@/src/survey-public/components/types"
import { backendConfig as defaultBackendConfig } from "@/src/survey-public/utils/backend-config-defaults"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurveyResponseTopicsByProject from "@/src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import deleteSurveyResponse from "@/src/survey-responses/mutations/deleteSurveyResponse"
import getFeedbackSurveyResponses from "@/src/survey-responses/queries/getFeedbackSurveyResponses"
import { getSurveyResponseCategoryById } from "@/src/survey-responses/utils/getSurveyResponseCategoryById"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect } from "react"
import getSurveySurveyResponsesBySurveySessionId from "../../queries/getSurveySurveyResponsesBySurveySessionId"
import EditableSurveyResponseAdditionalFilterFields from "./EditableSurveyResponseAdditionalFilterFields"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import { EditableSurveyResponseStatusLabel } from "./EditableSurveyResponseStatusLabel"
import EditableSurveyResponseUserText from "./EditableSurveyResponseUserText"

export type EditableSurveyResponseListItemProps = {
  response: Prettify<Awaited<ReturnType<typeof getFeedbackSurveyResponses>>[number]>
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topics: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
  isAccordion?: boolean
  subsections: SubsectionWithPosition[]
  refetchResponsesAndTopics: () => void
  showMap?: boolean
}

const EditableSurveyResponseListItem: React.FC<EditableSurveyResponseListItemProps> = ({
  response,
  operators,
  topics,
  subsections,
  isAccordion,
  refetchResponsesAndTopics,
  showMap,
}) => {
  const params = useRouterQuery()
  const open = !isAccordion ? true : parseInt(String(params.responseDetails)) === response.id
  const surveyId = useParam("surveyId", "string")
  const projectSlug = useProjectSlug()
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const [parsedSurveyResponse] = useQuery(getSurveySurveyResponsesBySurveySessionId, {
    projectSlug,
    surveySessionId: response.surveySession.id,
  })
  const [responseDetails, setRespnseDetails] = useQueryState("responseDetails", parseAsInteger)
  const [deleteCalendarEntryMutation] = useMutation(deleteSurveyResponse)

  useEffect(() => {
    const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", surveyDefinition.primaryColor)
    root.style.setProperty("--survey-dark-color", surveyDefinition.darkColor)
    root.style.setProperty("--survey-light-color", surveyDefinition.lightColor)
  }, [survey.slug])

  const handleOpen = () => {
    void setRespnseDetails(response.id)
  }
  const handleClose = () => {
    void setRespnseDetails(null)
  }
  const operatorSlugWitFallback = response.operator?.slug || "k.A."

  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const labels = backendConfig.labels || defaultBackendConfig.labels
  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)

  const mapProps = feedbackDefinition!.pages[1]!.questions.find(
    (q) => q.id === evaluationRefs["feedback-location"],
  )!.props as TMapProps
  const defaultViewState = mapProps?.config?.bounds

  const feedbackQuestions = []
  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }
  const feedbackQuestion = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )

  const maptilerUrl = surveyDefinition.maptilerUrl

  const userTextPreview =
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["feedback-usertext-1"]] ||
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["feedback-usertext-2"]]

  const feedbackUserCategory =
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["feedback-category"]] &&
    evaluationRefs["feedback-category"] &&
    getSurveyResponseCategoryById(
      // @ts-expect-error `data` is of type unkown
      Number(response.data[evaluationRefs["feedback-category"]]),
      feedbackQuestion!,
    )

  const additionalFilterFields = backendConfig.additionalFilters

  const getTranslatedSource = (s: string) => {
    switch (s) {
      case "LETTER":
        return "Brief"
      default:
        return "Email"
    }
  }

  const handleDelete = async () => {
    if (
      response.source !== "FORM" &&
      window.confirm(`Den Eintrag mit ID ${response.id} unwiderruflich löschen?`)
    ) {
      await deleteCalendarEntryMutation({ id: response.id })
      await refetchResponsesAndTopics()
    }
  }

  return (
    <article data-open={open} className="bg-white">
      <button
        className={clsx(
          "group flex w-full items-center justify-between py-4 pr-4 text-left text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
          open ? "bg-gray-50" : "border-b border-gray-300",
        )}
        onClick={isAccordion ? () => (open ? handleClose() : handleOpen()) : undefined}
      >
        <div className="flex items-center gap-4 px-6 pb-2 pt-3">
          <h3 className="text-gray-700">{response.id} </h3>
          <EditableSurveyResponseStatusLabel surveySlug={survey.slug} status={response.status} />
          <div
            className={clsx(
              "flex-shrink-0 rounded-full bg-gray-300 px-4 py-2 text-sm",
              operatorSlugWitFallback !== "k.A." && "uppercase",
            )}
          >
            <div>{operatorSlugWitFallback}</div>
          </div>

          <Markdown className="ml-4 line-clamp-2" markdown={userTextPreview} />
        </div>

        {isAccordion &&
          (open ? (
            <ChevronUpIcon className="h-5 w-5 flex-shrink-0 text-gray-700 group-hover:text-black" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 flex-shrink-0 text-gray-700 group-hover:text-black" />
          ))}
      </button>

      {open && (
        <div className={clsx("overflow-clip p-6", open ? "border-b border-gray-300" : "")}>
          {response.source !== "FORM" && (
            <span className="flex flex-row items-center gap-2">
              <EnvelopeIcon className="h-4 w-4" />
              <span>per {getTranslatedSource(response.source)} eingegangen </span>
              <IfUserCanEdit>
                <span>| </span>
                <button onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
                  Eintrag löschen
                </button>
              </IfUserCanEdit>
            </span>
          )}
          <div className="mb-8 flex flex-col items-start gap-8">
            <EditableSurveyResponseUserText
              surveyId={surveyId!}
              userTextIndices={[
                evaluationRefs["feedback-usertext-1"],
                evaluationRefs["feedback-usertext-2"],
              ]}
              feedbackQuestions={feedbackQuestions}
              response={response}
            />
            <div className="flex shrink-0 flex-col items-start gap-4">
              <h4 className="font-semibold">
                {labels.category?.sg || defaultBackendConfig.labels.category.sg}
              </h4>
              <div className="whitespace-nowrap rounded bg-gray-300 p-3 px-4 font-semibold">
                {feedbackUserCategory}
              </div>
            </div>
          </div>
          <EditableSurveyResponseAdditionalFilterFields
            additionalFilterFields={additionalFilterFields}
            surveyData={parsedSurveyResponse?.data}
            feedbackData={response.data}
          />
          <EditableSurveyResponseForm
            showMap={showMap}
            initialValues={{
              // Mapping to string is required so the ReactHookForm and our Radiobutton can compare the data to find what is selected
              surveyResponseTopics: response.surveyResponseTopics.map(String),
              operatorId: response.operatorId === null ? "0" : String(response.operatorId),
              // we can not call this "status"; the scopes of this form have to be different from the other form (filter form)! Otherwise this messes with our filter form and url state.
              responseStatus: response.status,
              note: response.note,
            }}
            userLocationQuestionId={evaluationRefs["feedback-location"]}
            response={response}
            operators={operators}
            topics={topics}
            subsections={subsections}
            refetchResponsesAndTopics={refetchResponsesAndTopics}
            maptilerUrl={maptilerUrl}
            defaultViewState={defaultViewState}
            backendConfig={backendConfig}
          />
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
