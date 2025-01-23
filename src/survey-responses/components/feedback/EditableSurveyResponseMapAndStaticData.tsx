import { Link, linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { TFeedbackQuestion } from "@/src/survey-public/components/types"
import {
  getBackendConfigBySurveySlug,
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
  getSurveyDefinitionBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { getQuestionsAsArray } from "@/src/survey-public/utils/getQuestionsAsArray"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { EnvelopeIcon } from "@heroicons/react/20/solid"
import { center, lineString, multiLineString } from "@turf/turf"
import { clsx } from "clsx"
import { LngLatBoundsLike } from "react-map-gl/maplibre"
import deleteSurveyResponse from "../../mutations/deleteSurveyResponse"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { getSurveyResponseCategoryById } from "../../utils/getSurveyResponseCategoryById"
import EditableSurveyResponseAdditionalFilterFields from "./EditableSurveyResponseAdditionalFilterFields"
import { EditableSurveyResponseFormMap } from "./EditableSurveyResponseFormMap"
import EditableSurveyResponseUserText from "./EditableSurveyResponseUserText"

type Props = {
  response: Prettify<
    Awaited<
      ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
    >["feedbackSurveyResponses"][number]
  >
  categoryLabel: string
  maptilerUrl: string
  defaultViewState: LngLatBoundsLike
  showMap?: boolean
  refetchResponsesAndTopics: () => void
}

const EditableSurveyResponseMapAndStaticData = ({
  response,
  showMap,
  categoryLabel,
  refetchResponsesAndTopics,
}: Props) => {
  const surveyId = useParam("surveyId", "string")
  const projectSlug = useProjectSlug()
  const [survey] = useQuery(getSurvey, { projectSlug, id: Number(surveyId) })
  const [deleteCalendarEntryMutation] = useMutation(deleteSurveyResponse)
  const surveyDefinition = getSurveyDefinitionBySurveySlug(survey.slug)
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug(survey.slug)
  const backendConfig = getBackendConfigBySurveySlug(survey.slug)
  const { evaluationRefs } = getResponseConfigBySurveySlug(survey.slug)
  const feedbackQuestions = getQuestionsAsArray({
    definition: feedbackDefinition,
    surveyPart: "feedback",
  }) as TFeedbackQuestion[]

  const feedbackQuestion = feedbackQuestions.find(
    (q) => q.id === evaluationRefs["category"],
  ) as TFeedbackQuestion

  const maptilerUrl = surveyDefinition.maptilerUrl

  const feedbackUserCategory =
    // @ts-expect-error `data` is of type unkown
    response.data[evaluationRefs["category"]] &&
    evaluationRefs["category"] &&
    getSurveyResponseCategoryById(
      // @ts-expect-error `data` is of type unkown
      Number(response.data[evaluationRefs["category"]]),
      feedbackQuestion!,
    )

  const userLocationQuestionId = evaluationRefs["location"]
  const geometryCategoryId = evaluationRefs["geometry-category"]

  const additionalFilterFields = backendConfig.additionalFilters

  const geometryCategoryCoordinates = geometryCategoryId
    ? // @ts-expect-error `data` is unkown
      JSON.parse(response.data[geometryCategoryId])
    : // we need to provide a fallback geometry for rs8 & frm7 where the geometry category was not introduced yet
      surveyDefinition.geometryFallback

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

  // todo survey clean up or refactor after survey BB line selection
  // we have the same functions in SurveyMap.tsx
  // todo handle geometry as features in the db, see ticket "TS: Refactoring: Beteiligung Geometrie-Kategorie als Feature speichern"
  // todo survey clean up or refactor after survey BB line selection
  const checkLineType = (selectedLine: any): string => {
    if (Array.isArray(selectedLine)) {
      if (Array.isArray(selectedLine[0])) {
        if (Array.isArray(selectedLine[0][0])) {
          return "MultiLineString" // 3D array
        }
        return "LineString" // 2D array
      }
    }
    return "Unknown"
  }
  const getParsedLine = (selectedLine: any) => {
    if (!selectedLine) return null
    const lineType = checkLineType(JSON.parse(selectedLine))

    switch (lineType) {
      case "LineString":
        // @ts-expect-error
        return lineString(JSON.parse(selectedLine))
      case "MultiLineString":
        // @ts-expect-error
        return multiLineString(JSON.parse(selectedLine))
      default:
        return null
    }
  }

  const atlasUrl = surveyDefinition.atlasUrl
    ? // @ts-expect-error `data` is unkown
      response.data[userLocationQuestionId]
      ? surveyDefinition.atlasUrl.replace(
          "MAPPARAM",
          // @ts-expect-error `data` is unkown
          `11%2F${response.data[userLocationQuestionId].lat.toFixed(3)}%2F${response.data[userLocationQuestionId].lng.toFixed(3)}`,
        )
      : surveyDefinition.atlasUrl.replace(
          "MAPPARAM",
          // @ts-expect-error `data` is unkown
          `11%2F${center(getParsedLine(response.data[geometryCategoryId])).geometry.coordinates[1].toFixed(3)}%2F${center(getParsedLine(response.data[geometryCategoryId])).geometry.coordinates[0].toFixed(3)}`,
        )
    : null

  return (
    <div className={clsx("grid gap-6 md:gap-4", showMap && "md:grid-cols-2")}>
      {atlasUrl && !showMap && (
        <Link target="_blank" href={atlasUrl}>
          Im Radverkehrsatlas öffnen
        </Link>
      )}
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
          userTextIndices={[evaluationRefs["usertext-1"], evaluationRefs["usertext-2"]]}
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
            geometryCategoryCoordinates={geometryCategoryCoordinates}
            maptilerUrl={maptilerUrl}
          />
          <div className="flex flex-col items-start pt-4">
            <Link
              href={Routes.SurveyResponseWithLocationPage({
                projectSlug,
                surveyId: surveyId!,
                responseDetails: response.id,
                selectedResponses: [response.id],
              })}
            >
              In großer Karte öffnen
            </Link>
            {atlasUrl && (
              <Link target="_blank" href={atlasUrl}>
                Im Radverkehrsatlas öffnen
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditableSurveyResponseMapAndStaticData
