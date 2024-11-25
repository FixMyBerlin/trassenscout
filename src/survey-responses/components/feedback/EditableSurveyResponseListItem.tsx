import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { useUserCan } from "@/src/pagesComponents/memberships/hooks/useUserCan"
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
import getSurvey from "@/src/surveys/queries/getSurvey"
import { useSession } from "@blitzjs/auth"
import { useParam, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import { clsx } from "clsx"
import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect } from "react"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import EditableSurveyResponseMapAndStaticData from "./EditableSurveyResponseMapAndStaticData"
import { EditableSurveyResponseStatusLabel } from "./EditableSurveyResponseStatusLabel"
import { NewSurveyResponseCommentForm } from "./comments/NewSurveyResponseCommentForm"
import { SurveyResponseCommentField } from "./comments/SurveyResponseCommentField"

export type EditableSurveyResponseListItemProps = {
  response: Prettify<
    Awaited<
      ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
    >["feedbackSurveyResponses"][number]
  >
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
  const [responseDetails, setRespnseDetails] = useQueryState("responseDetails", parseAsInteger)

  const session = useSession()
  const isEditorOrAdmin = useUserCan().edit || session.role === "ADMIN"

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

  const maptilerUrl = surveyDefinition.maptilerUrl

  const userTextPreview =
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["feedback-usertext-1"]] ||
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["feedback-usertext-2"]]

  return (
    <article data-open={open} className="bg-white">
      <button
        className={clsx(
          "group flex w-full items-center justify-between py-4 pr-4 text-left text-sm text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
          open ? "bg-gray-50" : "border-b border-gray-300",
          showMap || "cursor-default",
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
        <div
          className={clsx(
            "flex flex-col gap-6 overflow-clip p-6",
            open && "border-b border-gray-300",
          )}
        >
          <EditableSurveyResponseMapAndStaticData
            refetchResponsesAndTopics={refetchResponsesAndTopics}
            response={response}
            showMap={showMap}
            maptilerUrl={maptilerUrl}
            defaultViewState={defaultViewState}
            userLocationQuestionId={evaluationRefs["feedback-location"]}
            categoryLabel={labels.category?.sg || defaultBackendConfig.labels.category.sg}
          />
          <EditableSurveyResponseForm
            showMap={showMap}
            response={response}
            operators={operators}
            topics={topics}
            subsections={subsections}
            backendConfig={backendConfig}
          />
          <div>
            {(!!response.surveyResponseComments.length || isEditorOrAdmin) && (
              <h4 className="mb-3 font-semibold">Kommentar</h4>
            )}
            <ul className="flex max-w-3xl flex-col gap-4">
              {response.surveyResponseComments?.map((comment) => {
                return (
                  <li key={comment.id}>
                    <SurveyResponseCommentField comment={comment} />
                  </li>
                )
              })}
              <IfUserCanEdit>
                <li>
                  <NewSurveyResponseCommentForm surveyResponseId={response.id} />
                </li>
              </IfUserCanEdit>
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
