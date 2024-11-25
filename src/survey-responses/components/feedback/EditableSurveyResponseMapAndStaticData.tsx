import { Link, linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { TMapProps } from "@/src/survey-public/components/types"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { EnvelopeIcon } from "@heroicons/react/20/solid"
import clsx from "clsx"

import { LngLatBoundsLike } from "react-map-gl/dist/esm/exports-maplibre"
import deleteSurveyResponse from "../../mutations/deleteSurveyResponse"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { getSurveyResponseCategoryById } from "../../utils/getSurveyResponseCategoryById"
import EditableSurveyResponseAdditionalFilterFields from "./EditableSurveyResponseAdditionalFilterFields"
import { EditableSurveyResponseFormMap } from "./EditableSurveyResponseFormMap"
import EditableSurveyResponseUserText from "./EditableSurveyResponseUserText"

export type EditableSurveyResponseListItemProps = {
  response: Prettify<
    Awaited<
      ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
    >["feedbackSurveyResponses"][number]
  >
  categoryLabel: string
  userLocationQuestionId: number | undefined
  maptilerUrl: string
  defaultViewState: LngLatBoundsLike
  showMap?: boolean
  refetchResponsesAndTopics: () => void
}

const EditableSurveyResponseMapAndStaticData: React.FC<EditableSurveyResponseListItemProps> = ({
  response,
  showMap,
  userLocationQuestionId,
  categoryLabel,
  refetchResponsesAndTopics,
}) => {
  const surveyId = useParam("surveyId", "string")
  const projectSlug = useProjectSlug()
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const [deleteCalendarEntryMutation] = useMutation(deleteSurveyResponse)
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
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
      try {
        await deleteCalendarEntryMutation({ id: response.id })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      refetchResponsesAndTopics()
    }
  }

  return (
    <div className={clsx("grid gap-6 md:gap-4", showMap && "md:grid-cols-2")}>
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-6">
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
        {/* TEXT */}
        <EditableSurveyResponseUserText
          surveyId={surveyId!}
          userTextIndices={[
            evaluationRefs["feedback-usertext-1"],
            evaluationRefs["feedback-usertext-2"],
          ]}
          feedbackQuestions={feedbackQuestions}
          response={response}
        />
        {/* CATEGORY */}
        <div className="flex shrink-0 flex-col items-start gap-4">
          <h4 className="font-semibold">{categoryLabel}</h4>
          <div className="whitespace-nowrap rounded bg-gray-300 p-3 px-4 font-semibold">
            {feedbackUserCategory}
          </div>
        </div>
        {/* TABEL */}
        <EditableSurveyResponseAdditionalFilterFields
          additionalFilterFields={additionalFilterFields}
          surveyData={response.surveySurveyResponseData}
          feedbackData={response.data}
        />
      </div>
      {/* RIGHT SIDE */}
      {showMap && (
        <div>
          <EditableSurveyResponseFormMap
            surveySlug={survey.slug}
            marker={
              // @ts-expect-error `data` is unkown
              response.data[userLocationQuestionId] as { lat: number; lng: number } | undefined
            }
            maptilerUrl={maptilerUrl}
            defaultViewState={defaultViewState}
          />
          {
            // @ts-expect-error `data` is unkown
            response.data[userLocationQuestionId] && (
              <div className="pt-4">
                <Link
                  href={Routes.SurveyResponseWithLocationPage({
                    projectSlug,
                    surveyId: surveyId!,
                    surveyResponseId: response.id,
                  })}
                >
                  Alle verorteten Beiträge öffnen
                </Link>
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}

export default EditableSurveyResponseMapAndStaticData
