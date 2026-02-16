"use client"

import { getFlatSurveyFormFields } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getFlatSurveyFormFields"
import { getSurveyCategoryOptions } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_utils/getSurveyCategoryOptions"
import { surveyResponsesMapHref } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/_utils/SurveyHrefs"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { createGeoJSONFromString } from "@/src/app/beteiligung/_components/form/map/utils"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { Link, linkStyles } from "@/src/core/components/links"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { Prettify } from "@/src/core/types"
import deleteSurveyResponse from "@/src/server/survey-responses/mutations/deleteSurveyResponse"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useMutation } from "@blitzjs/rpc"
import { ArrowUpRightIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline"
import { center } from "@turf/turf"
import { clsx } from "clsx"
import { useParams } from "next/navigation"
import { LngLatBoundsLike, MapProvider } from "react-map-gl/maplibre"
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
  const projectSlug = useProjectSlug()
  const params = useParams<{ surveyId?: string | string[] }>()
  const rawSurveyId = params?.surveyId
  const surveyIdString = Array.isArray(rawSurveyId) ? rawSurveyId[0] : rawSurveyId
  const surveyId = Number(surveyIdString)
  const surveySlug = response.surveySession.survey.slug as AllowedSurveySlugs
  const [deleteCalendarEntryMutation] = useMutation(deleteSurveyResponse)

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

  const maptilerUrl = metaConfig.maptilerUrl

  const userCategoryId = response.data[categoryId]
  const surveyCategoryOptions = getSurveyCategoryOptions(surveySlug)
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
    <>
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
            surveyId={surveyIdString || ""}
            userTextIndices={[String(feedbackTextId), String(text2Id)]}
            feedbackQuestions={feedbackQuestions}
            response={response}
          />
          {/* CATEGORY */}
          <div className="flex shrink-0 flex-col items-start gap-4">
            <h4 className="font-semibold">{categoryLabel}</h4>
            <div className="rounded-sm bg-gray-300 p-3 px-4 font-semibold whitespace-nowrap">
              {userCategoryLabel}
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
                marker={response.data[locationId] as { lat: number; lng: number } | undefined}
                geometryCategoryCoordinates={
                  geometryCategoryId && response.data[geometryCategoryId]
                }
                geoCategoryQuestion={geoCategoryQuestion as GeoCategoryFieldConfig}
                maptilerUrl={maptilerUrl}
              />
            </MapProvider>
            <div className="flex flex-col items-start pt-4">
              <Link
                href={surveyResponsesMapHref(projectSlug, surveyId, {
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
    </>
  )
}

export default EditableSurveyResponseMapAndStaticData
