import { useParam, useRouterQuery } from "@blitzjs/next"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Prettify } from "src/core/types"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { ListItemStatus } from "src/stakeholdernotes/components/StakeholderSectionListItemStatus"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"
import { getSurveyResponseCategoryById } from "src/survey-responses/utils/getSurveyResponseCategoryById"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import EditableSurveyResponseUserText from "./EditableSurveyResponseUserText"

import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "src/survey-public/utils/getConfigBySurveySlug"
import { TMapProps } from "src/survey-public/components/types"
import getSurvey from "src/surveys/queries/getSurvey"
import { useQuery } from "@blitzjs/rpc"

export type EditableSurveyResponseListItemProps = {
  response: Prettify<Awaited<ReturnType<typeof getFeedbackSurveyResponses>>[number]>
  operators: Prettify<Awaited<ReturnType<typeof getOperatorsWithCount>>["operators"]>
  topics: Prettify<
    Awaited<ReturnType<typeof getSurveyResponseTopicsByProject>>["surveyResponseTopics"]
  >
  subsections: SubsectionWithPosition[]
  refetchResponsesAndTopics: () => void
}

const EditableSurveyResponseListItem: React.FC<EditableSurveyResponseListItemProps> = ({
  response,
  operators,
  topics,
  subsections,
  refetchResponsesAndTopics,
}) => {
  const router = useRouter()
  const handleOpen = () => {
    router.query.responseDetails = String(response.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.responseDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
  }

  const params = useRouterQuery()
  const open = parseInt(String(params.responseDetails)) === response.id
  const surveyId = useParam("surveyId", "string")
  const [survey] = useQuery(getSurvey, { id: Number(surveyId) })

  const operatorSlugWitFallback = response.operator?.slug || "k.A."

  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)

  const mapProps = feedbackDefinition!.pages[0]!.questions.find(
    (q) => q.id === evaluationRefs["feedback-location"],
  )!.props as TMapProps

  const maptilerStyleUrl = mapProps.maptilerStyleUrl
  const defaultViewState = mapProps?.config?.bounds

  const feedbackQuestions = []

  for (let page of feedbackDefinition.pages) {
    feedbackQuestions.push(...page.questions)
  }

  const feedbackQuestion = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["feedback-category"],
  )

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

  return (
    <article data-open={open}>
      <button
        className={clsx(
          "py-4 text-left text-sm text-gray-900 hover:bg-gray-50 group flex w-full items-center justify-between pr-4 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
          open ? "bg-gray-50" : "border-b border-gray-300",
        )}
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        <div className="gap-4 flex items-center px-6 pb-2 pt-3">
          <h3 className="text-gray-700">{response.id} </h3>
          <ListItemStatus status={response.status} />
          <div
            className={clsx(
              "bg-gray-300 rounded-full px-4 py-2 text-sm flex-shrink-0",
              operatorSlugWitFallback !== "k.A." && "uppercase",
            )}
          >
            <div>{operatorSlugWitFallback}</div>
          </div>

          <Markdown className="ml-4 line-clamp-2" markdown={userTextPreview} />
        </div>

        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className={clsx("overflow-clip p-6", open ? "border-b border-gray-300" : "")}>
          <div className="flex gap-12 mb-10 flex-col md:flex-row justify-between">
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
              <h4 className="font-semibold mb-5">Kategorie</h4>
              <div className="w-48 flex-shrink-0">
                <span className="p-3 px-4 bg-gray-300 rounded">{feedbackUserCategory}</span>
              </div>
            </div>
          </div>
          <EditableSurveyResponseForm
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
            maptilerStyleUrl={maptilerStyleUrl}
            defaultViewState={defaultViewState}
            pinColor={mapProps.config.pinColor}
          />
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
