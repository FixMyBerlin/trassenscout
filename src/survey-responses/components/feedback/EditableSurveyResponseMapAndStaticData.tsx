import { createGeoJSONFromString } from "@/src/app/beteiligung/_components/form/map/utils"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { Link, linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { Prettify } from "@/src/core/types"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { getFlatSurveyQuestions } from "@/src/survey-responses/utils/getQuestionsAsArray"
import { getSurveyCategoryOptions } from "@/src/survey-responses/utils/getSurveyCategoryOptions"
import getSurvey from "@/src/surveys/queries/getSurvey"
import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { ArrowUpRightIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { center } from "@turf/turf"
import { clsx } from "clsx"
import { LngLatBoundsLike, MapProvider } from "react-map-gl/maplibre"
import deleteSurveyResponse from "../../mutations/deleteSurveyResponse"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "../../queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import EditableSurveyResponseAdditionalFilterFields from "./EditableSurveyResponseAdditionalFilterFields"
import {
  EditableSurveyResponseFormMap,
  GeoCategoryFieldConfig,
} from "./EditableSurveyResponseFormMap"
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

  const feedbackDefinition = getConfigBySurveySlug(survey.slug, "part2")
  const backendConfig = getConfigBySurveySlug(survey.slug, "backend")
  const metaConfig = getConfigBySurveySlug(survey.slug, "meta")

  const feedbackQuestions = getFlatSurveyQuestions(feedbackDefinition)

  const geometryCategoryId = getQuestionIdBySurveySlug(survey.slug, "geometryCategory")
  const feedbackTextId = getQuestionIdBySurveySlug(survey.slug, "feedbackText")
  const text2Id = getQuestionIdBySurveySlug(survey.slug, "feedbackText_2")
  const categoryId = getQuestionIdBySurveySlug(survey.slug, "category")
  const locationId = getQuestionIdBySurveySlug(survey.slug, "location")

  const geoCategoryQuestion = feedbackQuestions.find((q) => q.name === geometryCategoryId)

  const maptilerUrl = metaConfig.maptilerUrl

  const userCategoryId = response.data[categoryId]
  const surveyCategoryOptions = getSurveyCategoryOptions(survey.slug)
  const userCategoryLabel = surveyCategoryOptions.find((o) => o.value == userCategoryId)?.label

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

  const tildaUrl = metaConfig.tildaUrl
    ? response.data[locationId]
      ? metaConfig.tildaUrl.replace(
          "MAPPARAM",
          `11%2F${response.data[locationId].lat.toFixed(3)}%2F${response.data[locationId].lng.toFixed(3)}`,
        )
      : geometryCategoryId &&
          response.data[geometryCategoryId] &&
          createGeoJSONFromString(response.data[geometryCategoryId])
        ? metaConfig.tildaUrl.replace(
            "MAPPARAM",
            // @ts-expect-error object is possibly 'undefined'
            `11%2F${center(createGeoJSONFromString(response.data[geometryCategoryId])).geometry.coordinates[1].toFixed(3)}%2F${center(createGeoJSONFromString(response.data[geometryCategoryId])).geometry.coordinates[0].toFixed(3)}`,
          )
        : null
    : null

  return (
    <div className={clsx("grid gap-6 md:gap-4", showMap && "md:grid-cols-2")}>
      {tildaUrl && !showMap && (
        <Link target="_blank" href={tildaUrl} className="flex items-center gap-2">
          <ArrowUpRightIcon className="h-3 w-3" />
          In Tilda öffnen
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
          userTextIndices={[String(feedbackTextId), String(text2Id)]}
          feedbackQuestions={feedbackQuestions}
          response={response}
        />
        {/* CATEGORY */}
        <div className="flex shrink-0 flex-col items-start gap-4">
          <h4 className="font-semibold">{categoryLabel}</h4>
          <div className="whitespace-nowrap rounded bg-gray-300 p-3 px-4 font-semibold">
            {userCategoryLabel}
          </div>
        </div>
        {/* TABEL */}
        <EditableSurveyResponseAdditionalFilterFields
          additionalFilterFields={additionalFilterFields}
          surveySlug={survey.slug}
          surveyPart1ResponseData={response.surveyPart1ResponseData}
          surveyPart3ResponseData={response.surveyPart3ResponseData}
          surveyPart2ResponseData={response.data}
        />
      </div>
      {/* RIGHT SIDE */}
      {showMap && (
        <div>
          <MapProvider>
            <EditableSurveyResponseFormMap
              surveySlug={survey.slug}
              marker={response.data[locationId] as { lat: number; lng: number } | undefined}
              geometryCategoryCoordinates={geometryCategoryId && response.data[geometryCategoryId]}
              geoCategoryQuestion={geoCategoryQuestion as GeoCategoryFieldConfig}
              maptilerUrl={maptilerUrl}
            />
          </MapProvider>
          <div className="flex flex-col items-start pt-4">
            <Link
              href={Routes.SurveyResponseWithLocationPage({
                projectSlug,
                surveyId: surveyId!,
                responseDetails: response.id,
                selectedResponses: [response.id],
              })}
              className="flex items-center gap-2"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
              In großer Karte öffnen
            </Link>
            {tildaUrl && (
              <Link target="_blank" href={tildaUrl} className="flex items-center gap-2">
                <ArrowUpRightIcon className="h-3 w-3" />
                In Tilda öffnen
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EditableSurveyResponseMapAndStaticData
