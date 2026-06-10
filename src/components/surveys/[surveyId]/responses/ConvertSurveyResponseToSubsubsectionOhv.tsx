/**
 * Component for converting a survey response to a subsubsection (Maßnahme).
 *
 * NOTE: This component currently only works for the `ohv-haltestellenfoerderung` survey
 * configuration and needs refinement for other surveys in the future.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { point } from "@turf/helpers"
import { useState } from "react"
import { parseSwitchableMapLocationFieldValue } from "@/src/components/beteiligung/form/map/utils"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { Link } from "@/src/components/core/components/links/Link"
import { blueButtonStyles, linkStyles } from "@/src/components/core/components/links/styles"
import { Notice } from "@/src/components/core/components/Notice/Notice"
import { Prettify } from "@/src/components/core/types"
import { adminLookupRowsQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { getSubsectionBySlugFn } from "@/src/server/subsections/subsections.functions"
import {
  createSubsubsectionFn,
  getSubsubsectionBySlugFn,
} from "@/src/server/subsubsections/subsubsections.functions"
import type { CreateSubsubsectionInput } from "@/src/server/subsubsections/subsubsections.inputSchemas"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"

export type ConvertSurveyResponseToSubsubsectionProps = {
  response: Prettify<FeedbackSurveyResponse>
  projectSlug: string
  surveySlug: AllowedSurveySlugs
}

type ConvertWithLookupProps = ConvertSurveyResponseToSubsubsectionProps & {
  normalizedResponseSlug: string
  normalizedResponseSubsectionSlug: string
}

const isNotFoundError = (error: unknown) => {
  const candidate = error as { name?: string; code?: string; message?: string } | null
  return (
    candidate?.name === "NotFoundError" ||
    candidate?.code === "P2025" ||
    candidate?.message === "No Subsubsection found"
  )
}

const ConvertSurveyResponseToSubsubsectionOhvWithLookup = ({
  response,
  projectSlug,
  surveySlug,
  normalizedResponseSlug,
  normalizedResponseSubsectionSlug,
}: ConvertWithLookupProps) => {
  const queryClient = useQueryClient()
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertedSubsubsectionSlug, setConvertedSubsubsectionSlug] = useState<string | null>(null)
  const createSubsubsectionMutation = useMutation({ mutationFn: createSubsubsectionFn })

  const existingSubsubsectionLookup = useQuery({
    queryKey: [
      "subsubsectionBySlug",
      projectSlug,
      normalizedResponseSubsectionSlug,
      normalizedResponseSlug,
    ],
    queryFn: async () => {
      try {
        return await getSubsubsectionBySlugFn({
          data: {
            projectSlug,
            subsectionSlug: normalizedResponseSubsectionSlug,
            subsubsectionSlug: normalizedResponseSlug,
          },
        })
      } catch (error) {
        if (isNotFoundError(error)) return null
        throw error
      }
    },
  })

  const lookupError =
    existingSubsubsectionLookup.error != null
      ? "Verknüpfte Maßnahme konnte nicht geprüft werden."
      : null
  const existingSubsubsectionSlug =
    convertedSubsubsectionSlug ?? existingSubsubsectionLookup.data?.slug ?? null
  const hasCheckedExistingEntry = existingSubsubsectionLookup.isFetched

  const handleConvertToMassnahme = async () => {
    try {
      setConvertError(null)
      setConvertedSubsubsectionSlug(null)

      let subsection
      try {
        subsection = await getSubsectionBySlugFn({
          data: {
            projectSlug,
            subsectionSlug: normalizedResponseSubsectionSlug,
          },
        })
      } catch (error) {
        if (isNotFoundError(error)) {
          throw new Error(
            `Kein Abschnitt mit dem Slug "${normalizedResponseSubsectionSlug}" gefunden. Bitte stellen Sie sicher, dass ein Abschnitt mit diesem Slug im Projekt existiert.`,
          )
        }
        throw error
      }

      const questionCategoryId = getQuestionIdBySurveySlug(surveySlug, "category")
      const responseCategoryValue = response.data[questionCategoryId]
      const responseCategorySlugs = (
        Array.isArray(responseCategoryValue)
          ? responseCategoryValue
          : responseCategoryValue != null
            ? [responseCategoryValue]
            : []
      ) as string[]

      const subsubsectionInfrastructureTypes = (await queryClient.fetchQuery(
        adminLookupRowsQueryOptions({
          projectSlug,
          table: "subsubsectionInfrastructureTypes",
        }),
      )) as unknown as Array<{ id: number; slug: string }>
      const matchingInfrastructureTypes = subsubsectionInfrastructureTypes.filter(
        (infraType: { id: number; slug: string }) => responseCategorySlugs.includes(infraType.slug),
      )
      const subsubsectionInfrastructureTypeIds = matchingInfrastructureTypes.map(
        (infraType) => infraType.id,
      )

      const locationPoint = parseSwitchableMapLocationFieldValue(response.data["location"])
      if (locationPoint == null) {
        throw new Error("Standort (location) fehlt oder ist ungültig.")
      }
      const geometry = point([locationPoint.lng, locationPoint.lat]).geometry

      const description = response.data["stateOfConstruction"]
        ? `${String(response.data["feedbackText"] ?? "")}\nStand der Bauvorbereitung: ${String(response.data["stateOfConstruction"])}`
        : String(response.data["feedbackText"] ?? "")

      const createInput: CreateSubsubsectionInput = {
        projectSlug,
        slug: normalizedResponseSlug,
        type: "POINT" as const,
        geometry: geometry as { type: "Point"; coordinates: [number, number] },
        description,
        subsectionId: subsection.id,
        isExistingInfra: false,
        labelPos: "top" as const,
        subsubsectionInfrastructureTypeIds,
        estimatedConstructionDateString:
          response.data["realisationYear"] != null
            ? String(response.data["realisationYear"])
            : null,
        costEstimate:
          response.data["costs"] != null && response.data["costs"] !== ""
            ? Number(response.data["costs"])
            : null,
        planningCosts: null,
        location: null,
        subTitle: null,
        lengthM: null,
        width: null,
        widthExisting: null,
        planningPeriod: null,
        constructionPeriod: null,
        estimatedCompletionDate: null,
        deliveryCosts: null,
        constructionCosts: null,
        landAcquisitionCosts: null,
        expensesOfficialOrders: null,
        expensesTechnicalVerification: null,
        nonEligibleExpenses: null,
        revenuesEconomicIncome: null,
        contributionsThirdParties: null,
        grantsOtherFunding: null,
        ownFunds: null,
        qualityLevelId: null,
        managerId: null,
        subsubsectionStatusId: null,
        subsubsectionTaskId: null,
        subsubsectionInfraId: null,
        maxSpeed: null,
        trafficLoad: null,
        specialFeatures: false,
      }

      const result = await createSubsubsectionMutation.mutateAsync({
        data: createInput,
      })

      await queryClient.invalidateQueries({
        queryKey: ["subsubsection"],
      })

      setConvertedSubsubsectionSlug(result.slug)
    } catch (error: unknown) {
      console.error("Error converting survey response to subsubsection:", error)
      setConvertError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {existingSubsubsectionSlug && (
        <Notice type="warn" title="Verknüpfung zur Maßnahmenplanung">
          <p>Aus diesem Beitrag wurde ein Maßnahmeneintrag erstellt.</p>
          <p className="mt-2">
            Verknüpfung sichtbar:{" "}
            <Link
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
              params={{
                projectSlug,
                subsectionSlug: normalizedResponseSubsectionSlug,
                subsubsectionSlug: existingSubsubsectionSlug,
              }}
              className={linkStyles}
            >
              Zur Maßnahme
            </Link>
          </p>
        </Notice>
      )}
      {(convertError || lookupError) && (
        <div className="rounded-sm bg-red-50 p-4 text-red-800">
          <p className="text-sm">{convertError ?? lookupError}</p>
        </div>
      )}
      {!existingSubsubsectionSlug && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleConvertToMassnahme}
            className={blueButtonStyles}
            disabled={createSubsubsectionMutation.isPending || !hasCheckedExistingEntry}
          >
            {createSubsubsectionMutation.isPending
              ? "Wird erstellt..."
              : "In Maßnahmenplanung überführen"}
          </button>
        </div>
      )}
    </div>
  )
}

export const ConvertSurveyResponseToSubsubsectionOhv = ({
  response,
  projectSlug,
  surveySlug,
}: ConvertSurveyResponseToSubsubsectionProps) => {
  const normalizedResponseSlug =
    typeof response.data["referenceId"] === "string"
      ? response.data["referenceId"].toLowerCase()
      : null

  const normalizedResponseSubsectionSlug = response.data["commune"]
    ? String(response.data["commune"]).toLowerCase()
    : null

  if (projectSlug !== "ohv") {
    return null
  }

  if (!normalizedResponseSlug || !normalizedResponseSubsectionSlug) {
    return null
  }

  return (
    <ConvertSurveyResponseToSubsubsectionOhvWithLookup
      response={response}
      projectSlug={projectSlug}
      surveySlug={surveySlug}
      normalizedResponseSlug={normalizedResponseSlug}
      normalizedResponseSubsectionSlug={normalizedResponseSubsectionSlug}
    />
  )
}
