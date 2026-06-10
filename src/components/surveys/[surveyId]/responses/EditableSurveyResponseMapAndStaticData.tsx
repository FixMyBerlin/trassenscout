import { ArrowUpRightIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { useMutation } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { center } from "@turf/turf"
import { clsx } from "clsx"
import { LngLatBoundsLike, MapProvider } from "react-map-gl/maplibre"
import { createGeoJSONFromString } from "@/src/components/beteiligung/form/map/utils"
import { FieldConfig } from "@/src/components/beteiligung/shared/types"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Prettify } from "@/src/components/core/types"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { getFlatSurveyFormFields } from "@/src/components/surveys/[surveyId]/responses/getFlatSurveyFormFields"
import { getSurveyCategoryOptions } from "@/src/components/surveys/[surveyId]/responses/getSurveyCategoryOptions"
import { deleteSurveyResponseFn } from "@/src/server/survey-responses/surveyResponses.functions"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import EditableSurveyResponseAdditionalFilterFields from "./EditableSurveyResponseAdditionalFilterFields"
import {
  EditableSurveyResponseFormMap,
  GeoCategoryFieldConfig,
} from "./EditableSurveyResponseFormMap"
import EditableSurveyResponseUserText from "./EditableSurveyResponseUserText"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type FormFieldConfig = Extract<FieldConfig, { componentType: "form" }>

/**
 * Retrieve the `config.bounds` from the survey field config to use as the map's
 * initial viewport when a response has neither a location pin nor geometry coordinates.
 */
const getConfigBoundsFromFieldConfig = (
  feedbackQuestions: FormFieldConfig[],
  locationId: string,
  geometryCategoryId: string,
) => {
  const locationQuestion = feedbackQuestions.find((q) => q.name === locationId)
  if (locationQuestion) {
    // @ts-expect-error locationQuestion is of type LocationFieldConfig
    return locationQuestion.props.mapProps.config.bounds
  }

  const geoCategoryQuestion = feedbackQuestions.find((q) => q.name === geometryCategoryId)
  if (geoCategoryQuestion) {
    // @ts-expect-error geoCategoryQuestion is of type GeoCategoryFieldConfig
    return geoCategoryQuestion.props.mapProps.config.bounds
  }

  throw new Error("Survey config must have either a location or geometryCategory field")
}

type Props = {
  response: Prettify<FeedbackSurveyResponse>
  categoryLabel: string
  maptilerUrl: string
  defaultViewState: LngLatBoundsLike
  showMap?: boolean
  refetchResponsesAndTopics: () => Promise<void>
}

const EditableSurveyResponseMapAndStaticData = ({
  response,
  showMap,
  categoryLabel,
  refetchResponsesAndTopics,
}: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const surveyId = response.surveySession.survey.id
  const surveyIdString = String(surveyId)
  const surveySlug = response.surveySession.survey.slug as AllowedSurveySlugs
  const deleteSurveyResponseMutation = useMutation({ mutationFn: deleteSurveyResponseFn })

  const feedbackDefinition = getConfigBySurveySlug(surveySlug, "part2")
  const backendConfig = getConfigBySurveySlug(surveySlug, "backend")
  const metaConfig = getConfigBySurveySlug(surveySlug, "meta")

  const feedbackQuestions = getFlatSurveyFormFields(feedbackDefinition)

  const geometryCategoryId = getQuestionIdBySurveySlug(surveySlug, "geometryCategory")
  const feedbackTextId = getQuestionIdBySurveySlug(surveySlug, "feedbackText")
  const text2Id = getQuestionIdBySurveySlug(surveySlug, "feedbackText_2")
  const categoryId = getQuestionIdBySurveySlug(surveySlug, "category")
  const locationId = getQuestionIdBySurveySlug(surveySlug, "location")

  const geoCategoryQuestion = feedbackQuestions.find((q) => q.name === geometryCategoryId)
  const configBounds = getConfigBoundsFromFieldConfig(
    feedbackQuestions,
    locationId,
    geometryCategoryId,
  )

  const maptilerUrl = metaConfig.maptilerUrl

  const userCategoryValue = response.data[categoryId]
  const userCategoryIds = Array.isArray(userCategoryValue)
    ? userCategoryValue
    : userCategoryValue != null && userCategoryValue !== ""
      ? [userCategoryValue]
      : []
  const surveyCategoryOptions = getSurveyCategoryOptions(surveySlug)
  const userCategoryLabels = (userCategoryIds as Array<string | number>)
    .map(
      (selectedCategoryId) =>
        surveyCategoryOptions.find((o) => String(o.value) === String(selectedCategoryId))?.label,
    )
    .filter(Boolean) as string[]

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
        await deleteSurveyResponseMutation.mutateAsync({
          data: { projectSlug, id: response.id },
        })
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await refetchResponsesAndTopics()
    }
  }

  const locationPin = response.data[locationId] as { lat: number; lng: number } | undefined
  const geometryCategoryValue = geometryCategoryId
    ? (response.data[geometryCategoryId] as string | undefined)
    : undefined
  const tildaUrl = metaConfig.tildaUrl
    ? locationPin
      ? metaConfig.tildaUrl.replace(
          "MAPPARAM",
          `11%2F${locationPin.lat.toFixed(3)}%2F${locationPin.lng.toFixed(3)}`,
        )
      : geometryCategoryId &&
          geometryCategoryValue &&
          createGeoJSONFromString(geometryCategoryValue)
        ? metaConfig.tildaUrl.replace(
            "MAPPARAM",
            // @ts-expect-error object is possibly 'undefined'
            `11%2F${center(createGeoJSONFromString(geometryCategoryValue)).geometry.coordinates[1].toFixed(3)}%2F${center(createGeoJSONFromString(geometryCategoryValue)).geometry.coordinates[0].toFixed(3)}`,
          )
        : null
    : null

  return (
    <>
      <div className={clsx("grid gap-6 md:gap-4", showMap && "md:grid-cols-2")}>
        {tildaUrl && !showMap && (
          <Link target="_blank" href={tildaUrl} className="flex items-center gap-2">
            <ArrowUpRightIcon className="size-3" />
            In Tilda öffnen
          </Link>
        )}
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6">
          {response.source !== "FORM" && (
            <span className="flex flex-row items-center gap-2">
              <EnvelopeIcon className="size-4" />
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
            surveyId={surveyIdString || ""}
            userTextIndices={[String(feedbackTextId), String(text2Id)]}
            feedbackQuestions={feedbackQuestions}
            response={response}
          />
          {/* CATEGORY */}
          <div className="flex shrink-0 flex-col items-start gap-4">
            <h4 className="font-semibold">{categoryLabel}</h4>
            <div className="flex w-full flex-wrap gap-2">
              {userCategoryLabels.map((label) => (
                <div
                  key={label}
                  className="max-w-full rounded-sm bg-gray-300 p-3 px-4 font-semibold break-words whitespace-normal"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          {/* TABEL */}
          <EditableSurveyResponseAdditionalFilterFields
            additionalFilterFields={additionalFilterFields}
            surveySlug={surveySlug}
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
                surveySlug={surveySlug}
                marker={locationPin}
                geometryCategoryCoordinates={geometryCategoryValue}
                geoCategoryQuestion={geoCategoryQuestion as GeoCategoryFieldConfig}
                configBounds={configBounds}
                maptilerUrl={maptilerUrl}
              />
            </MapProvider>
            <div className="flex flex-col items-start pt-4">
              <Link
                to={`/${projectSlug}/surveys/${surveyId}/responses/map?responseDetails=${response.id}&selectedResponses=${response.id}`}
                className="flex items-center gap-2"
              >
                <ArrowsPointingOutIcon className="size-4" />
                In großer Karte öffnen
              </Link>
              {tildaUrl && (
                <Link target="_blank" href={tildaUrl} className="flex items-center gap-2">
                  <ArrowUpRightIcon className="size-3" />
                  In Tilda öffnen
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EditableSurveyResponseMapAndStaticData
