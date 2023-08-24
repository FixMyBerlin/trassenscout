import { useRouterQuery } from "@blitzjs/next"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Prettify } from "src/core/types"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import getSurveyResponseTopicsByProject from "src/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getFeedbackSurveyResponses from "src/survey-responses/queries/getFeedbackSurveyResponses"
import { getSurveyResponseCategoryById } from "src/survey-responses/utils/getSurveyResponseCategoryById"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import StatusTag from "./StatusTag"

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

  const operatorSlugWitFallback = response.operator?.slug || "k.A."
  // @ts-expect-error `data` is of type unkown
  const userText = response.data["34"] || response.data["35"]
  const userCategory =
    // @ts-expect-error `data` is of type unkown
    response.data["21"] && getSurveyResponseCategoryById(Number(response.data["21"]))

  return (
    <article data-open={open}>
      <button
        className={clsx(
          "py-4 text-left text-sm text-gray-900 hover:bg-gray-50 group flex w-full items-center justify-between pr-4 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
          open ? "bg-gray-50" : "border-b border-gray-300",
        )}
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        <h3 className="gap-4 flex grow items-center px-6 pb-2 pt-3 text-gray-700">
          {response.id}
          <StatusTag status={response.status} />
          <span className=" bg-gray-300 rounded-full uppercase px-4 py-2 font-semibold">
            {operatorSlugWitFallback}
          </span>
        </h3>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className={clsx("overflow-clip p-6", open ? "border-b border-gray-300" : "")}>
          <div className="flex gap-12 mb-10 flex-col md:flex-row justify-between">
            <blockquote className="bg-yellow-100 p-4 mb-6">
              <Markdown markdown={userText} />
              <div className="text-right text-gray-500">{`Bürgerbeitrag vom: ${response.surveySession.createdAt.toLocaleDateString()} um  ${response.surveySession.createdAt.toLocaleTimeString()}`}</div>
            </blockquote>
            <div>
              <h4 className="font-bold mb-5">Kategorie</h4>
              <div className="w-48 flex-shrink-0">
                <span className="p-3 px-4 bg-gray-300 rounded">{userCategory}</span>
              </div>
            </div>
          </div>
          <EditableSurveyResponseForm
            initialValues={{
              ...response,
              // Mapping to string is required so the ReactHookForm and our Radiobutton can compare the data to find what is selected
              surveyResponseTopics: response.surveyResponseTopics.map(String),
              operatorId: response.operatorId === null ? 0 : String(response.operatorId),
            }}
            response={response}
            operators={operators}
            topics={topics}
            subsections={subsections}
            refetchResponsesAndTopics={refetchResponsesAndTopics}
          />
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
