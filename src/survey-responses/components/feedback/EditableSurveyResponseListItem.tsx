import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { linkStyles } from "@/src/core/components/links"
import { Prettify } from "@/src/core/types"
import getOperatorsWithCount from "@/src/operators/queries/getOperatorsWithCount"
import { SubsectionWithPosition } from "@/src/subsections/queries/getSubsection"
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
import clsx from "clsx"
import { useRouter } from "next/router"
import { useEffect } from "react"
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
  const router = useRouter()
  const params = useRouterQuery()
  const open = !isAccordion ? true : parseInt(String(params.responseDetails)) === response.id
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })

  const [deleteCalendarEntryMutation] = useMutation(deleteSurveyResponse)

  useEffect(() => {
    const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", surveyDefinition.primaryColor)
    root.style.setProperty("--survey-dark-color", surveyDefinition.darkColor)
    root.style.setProperty("--survey-light-color", surveyDefinition.lightColor)
  }, [survey.slug])

  const handleOpen = () => {
    router.query.responseDetails = String(response.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.responseDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
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
              <span>| </span>
              <button onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
                Eintrag löschen
              </button>
            </span>
          )}
          <div className="mb-10 flex flex-col justify-between gap-12 md:flex-row">
            <EditableSurveyResponseUserText
              surveyId={surveyId!}
              userTextIndices={[
                evaluationRefs["feedback-usertext-1"],
                evaluationRefs["feedback-usertext-2"],
              ]}
              feedbackQuestions={feedbackQuestions}
              response={response}
            />
            <div>
              <h4 className="mb-5 font-semibold">{labels.category?.sg || "Kategorie"}</h4>
              <div className="w-48 flex-shrink-0">
                <span className="rounded bg-gray-300 p-3 px-4">{feedbackUserCategory}</span>
              </div>
            </div>
          </div>
          <EditableSurveyResponseForm
            showMap={showMap}
            initialValues={{
              ...response,
              // Mapping to string is required so the ReactHookForm and our Radiobutton can compare the data to find what is selected
              surveyResponseTopics: response.surveyResponseTopics.map(String),
              operatorId: response.operatorId === null ? "0" : String(response.operatorId),
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
