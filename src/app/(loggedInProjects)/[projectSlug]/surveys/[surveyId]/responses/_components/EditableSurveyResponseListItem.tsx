import { NewSurveyResponseCommentForm } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/NewSurveyResponseCommentForm"
import { SurveyResponseCommentField } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/SurveyResponseCommentField"
import { EditableSurveyResponseForm } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/EditableSurveyResponseForm"
import EditableSurveyResponseMapAndStaticData from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/EditableSurveyResponseMapAndStaticData"
import { EditableSurveyResponseStatusLabel } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/EditableSurveyResponseStatusLabel"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { backendConfig as defaultBackendConfig } from "@/src/app/beteiligung/_shared/backend-types"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/core/components/Map/SurveyStaticPin"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { Prettify } from "@/src/core/types"
import { useUserCan } from "@/src/pagesComponents/memberships/hooks/useUserCan"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSurveyResponseTopicsByProject from "@/src/server/survey-response-topics/queries/getSurveyResponseTopicsByProject"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useSession } from "@blitzjs/auth"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"
import { useEffect } from "react"
import { useResponseDetails } from "./useResponseDetails.nuqs"

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
  refetchResponsesAndTopics: () => void
  showMap?: boolean
  mapProps: any
}

const EditableSurveyResponseListItem = ({
  response,
  operators,
  topics,
  isAccordion,
  refetchResponsesAndTopics,
  showMap,
  mapProps,
}: EditableSurveyResponseListItemProps) => {
  const { responseDetails, setResponseDetails } = useResponseDetails()
  const open = !isAccordion ? true : parseInt(String(responseDetails)) === response.id
  const surveySlug = response.surveySession.survey.slug as AllowedSurveySlugs

  const session = useSession()
  const isEditorOrAdmin = useUserCan().edit || session.role === "ADMIN"

  const metaDefinition = getConfigBySurveySlug(surveySlug, "meta")

  useEffect(() => {
    // legacy surveys
    const root = document.documentElement
    root.style.setProperty("--survey-primary-color", metaDefinition.primaryColor)
    root.style.setProperty("--survey-dark-color", metaDefinition.darkColor)
    root.style.setProperty("--survey-light-color", metaDefinition.lightColor)
  }, [surveySlug, metaDefinition.darkColor, metaDefinition.lightColor, metaDefinition.primaryColor])

  // legacy surveys
  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")

  const handleOpen = () => {
    void setResponseDetails(response.id)
  }
  const handleClose = () => {
    void setResponseDetails(null)
  }
  const operatorSlugWitFallback = response.operator?.slug || "k.A."

  const labels = backendConfig.labels || defaultBackendConfig.labels

  const defaultViewState = mapProps?.config?.bounds

  const locationId = getQuestionIdBySurveySlug(surveySlug, "location")
  const text1Id = getQuestionIdBySurveySlug(surveySlug, "feedbackText")
  const text2Id = getQuestionIdBySurveySlug(surveySlug, "feedbackText_2")

  const userTextPreview = response.data[text1Id] || response.data[text2Id]

  return (
    <article data-open={open} className="bg-white">
      <button
        className={clsx(
          "group w-full py-4 pr-4 text-left text-sm text-gray-900 hover:bg-gray-50 focus:outline-hidden focus-visible:ring focus-visible:ring-gray-500/75 sm:pr-6",
          open ? "bg-gray-50" : "border-b border-gray-300",
        )}
        onClick={isAccordion ? () => (open ? handleClose() : handleOpen()) : undefined}
      >
        {response.data[locationId] && (
          <div className="pl-6">
            <SurveyStaticPin surveySlug={surveySlug} small />
          </div>
        )}

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4 px-6 pt-1 pb-2">
            <h3 className="text-gray-700">{response.id} </h3>
            <EditableSurveyResponseStatusLabel
              surveySlug={surveySlug}
              short={!showMap}
              status={response.status}
            />
            <div
              className={clsx(
                "shrink-0 rounded-full bg-gray-300 px-4 py-2 text-sm",
                operatorSlugWitFallback !== "k.A." && "uppercase",
              )}
            >
              <div>{operatorSlugWitFallback}</div>
            </div>

            <Markdown className="ml-4 line-clamp-2 shrink break-all" markdown={userTextPreview} />
          </div>

          {isAccordion &&
            (open ? (
              <ChevronUpIcon className="h-5 w-5 shrink-0 text-gray-700 group-hover:text-black" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-700 group-hover:text-black" />
            ))}
        </div>
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
            maptilerUrl={metaDefinition.maptilerUrl}
            defaultViewState={defaultViewState}
            categoryLabel={labels.category?.sg || defaultBackendConfig.labels.category.sg}
          />
          <EditableSurveyResponseForm
            showMap={showMap}
            response={response}
            operators={operators}
            topics={topics}
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
