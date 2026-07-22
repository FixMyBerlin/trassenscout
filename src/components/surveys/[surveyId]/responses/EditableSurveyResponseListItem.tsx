import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid"
import { useMutation } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect } from "react"
import { twJoin } from "tailwind-merge"
import { backendConfig as defaultBackendConfig } from "@/src/components/beteiligung/shared/backend-types"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import SurveyStaticPin from "@/src/components/core/components/Map/SurveyStaticPin"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { Prettify } from "@/src/components/core/types"
import type { OperatorWithSubsectionCount } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import {
  createSurveyResponseCommentFn,
  deleteSurveyResponseCommentFn,
  updateSurveyResponseCommentFn,
} from "@/src/server/survey-response-comments/surveyResponseComments.functions"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import type { SurveyResponseTagsResult } from "@/src/server/surveyResponseTags/surveyResponseTagsQueryOptions"
import { CommentField } from "./comments/CommentField"
import { NewCommentForm } from "./comments/NewCommentForm"
import { ConvertSurveyResponseToSubsubsectionOhv } from "./ConvertSurveyResponseToSubsubsectionOhv"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import EditableSurveyResponseMapAndStaticData from "./EditableSurveyResponseMapAndStaticData"
import { EditableSurveyResponseStatusLabel } from "./EditableSurveyResponseStatusLabel"
import { SurveyResponseAdminDeleteBox } from "./SurveyResponseAdminDeleteBox"
import { useSurveyResponseDetails as useResponseDetails } from "./useSurveyResponseDetails"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export type EditableSurveyResponseListItemProps = {
  response: Prettify<FeedbackSurveyResponse>
  operators: OperatorWithSubsectionCount[]
  topics: Prettify<SurveyResponseTagsResult["surveyResponseTags"]>
  isAccordion?: boolean
  refetchResponsesAndTopics: () => Promise<void>
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
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const createSurveyResponseCommentMutation = useMutation({
    mutationFn: createSurveyResponseCommentFn,
  })
  const updateSurveyResponseCommentMutation = useMutation({
    mutationFn: updateSurveyResponseCommentFn,
  })
  const deleteSurveyResponseCommentMutation = useMutation({
    mutationFn: deleteSurveyResponseCommentFn,
  })
  const open = !isAccordion ? true : parseInt(String(responseDetails)) === response.id
  const surveySlug = response.surveySession.survey.slug as AllowedSurveySlugs

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
  const commentLabel = labels.comment?.sg || defaultBackendConfig.labels.comment.sg
  const commentHelp = labels.comment?.help || defaultBackendConfig.labels.comment.help

  return (
    <article data-open={open} className="bg-white">
      <button
        className={twJoin(
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
              className={twJoin(
                "shrink-0 rounded-full bg-gray-300 px-4 py-2 text-sm",
                operatorSlugWitFallback !== "k.A." ? "uppercase" : "",
              )}
            >
              <div>{operatorSlugWitFallback}</div>
            </div>

            <Markdown
              className="ml-4 line-clamp-2 shrink break-all"
              markdown={typeof userTextPreview === "string" ? userTextPreview : null}
            />
          </div>

          {isAccordion &&
            (open ? (
              <ChevronUpIcon className="size-5 shrink-0 text-gray-700 group-hover:text-black" />
            ) : (
              <ChevronDownIcon className="size-5 shrink-0 text-gray-700 group-hover:text-black" />
            ))}
        </div>
      </button>

      {open && (
        <div
          className={twJoin(
            "flex flex-col gap-6 overflow-clip p-6",
            open ? "border-b border-gray-300" : "",
          )}
        >
          <EditableSurveyResponseMapAndStaticData
            response={response}
            showMap={showMap}
            maptilerUrl={metaDefinition.maptilerUrl}
            defaultViewState={defaultViewState}
            categoryLabel={labels.category?.sg || defaultBackendConfig.labels.category.sg}
          />
          <EditableSurveyResponseForm
            showMap={showMap}
            withTags={false}
            response={response}
            operators={operators}
            topics={topics}
            backendConfig={backendConfig}
            refetchResponsesAndTopics={refetchResponsesAndTopics}
          />
          <div>
            <h4 className="mb-3 font-semibold">{commentLabel}</h4>
            <ul className="flex max-w-3xl flex-col gap-4">
              {response.surveyResponseComments?.map((comment) => {
                return (
                  <li key={comment.id}>
                    <CommentField
                      comment={comment}
                      commentLabel={commentLabel}
                      mutateComment={{
                        update: async (body) => {
                          await updateSurveyResponseCommentMutation.mutateAsync({
                            data: {
                              projectSlug: projectSlug!,
                              id: comment.id,
                              body,
                            },
                          })
                          await refetchResponsesAndTopics()
                        },
                        remove: async () => {
                          await deleteSurveyResponseCommentMutation.mutateAsync({
                            data: {
                              projectSlug: projectSlug!,
                              id: comment.id,
                            },
                          })
                          await refetchResponsesAndTopics()
                        },
                      }}
                    />
                  </li>
                )
              })}
              <li>
                <NewCommentForm
                  commentLabel={commentLabel}
                  commentHelp={commentHelp}
                  createComment={async (body) => {
                    await createSurveyResponseCommentMutation.mutateAsync({
                      data: {
                        projectSlug: projectSlug!,
                        surveyResponseId: response.id,
                        body,
                      },
                    })
                    await refetchResponsesAndTopics()
                  }}
                />
              </li>
            </ul>
          </div>
          <ConvertSurveyResponseToSubsubsectionOhv
            response={response}
            projectSlug={projectSlug}
            surveySlug={surveySlug}
          />
          {projectSlug && (
            <SurveyResponseAdminDeleteBox
              response={response}
              projectSlug={projectSlug}
              refetchResponsesAndTopics={refetchResponsesAndTopics}
            />
          )}
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
