"use client"

/**
 * Component for converting a survey response to a subsubsection (Maßnahme).
 *
 * NOTE: This component currently only works for the `ohv-haltestellenfoerderung` survey
 * configuration and needs refinement for other surveys in the future.
 */

import { parseSwitchableMapLocationFieldValue } from "@/src/app/beteiligung/_components/form/map/utils"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { Notice } from "@/src/core/components/Notice/Notice"
import { blueButtonStyles, linkStyles } from "@/src/core/components/links/styles"
import { subsubsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { Prettify } from "@/src/core/types"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import createSubsubsection from "@/src/server/subsubsections/mutations/createSubsubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, invoke, useMutation } from "@blitzjs/rpc"
import { point } from "@turf/helpers"
import { NotFoundError } from "blitz"
import Link from "next/link"
import { useEffect, useState } from "react"

export type ConvertSurveyResponseToSubsubsectionProps = {
  response: Prettify<
    Awaited<
      ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
    >["feedbackSurveyResponses"][number]
  >
  projectSlug: string
  surveySlug: AllowedSurveySlugs
}

type ConvertWithLookupProps = ConvertSurveyResponseToSubsubsectionProps & {
  normalizedResponseSlug: string
  normalizedResponseSubsectionSlug: string
}

const isNotFoundError = (error: unknown) => {
  if (error instanceof NotFoundError) return true

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
  const [convertError, setConvertError] = useState<string | null>(null)
  const [existingSubsubsectionSlug, setExistingSubsubsectionSlug] = useState<string | null>(null)
  const [createSubsubsectionMutation, { isLoading }] = useMutation(createSubsubsection)
  const [hasCheckedExistingEntry, setHasCheckedExistingEntry] = useState(false)

  useEffect(() => {
    let isMounted = true
    setHasCheckedExistingEntry(false)
    setConvertError(null)
    setExistingSubsubsectionSlug(null)

    const lookupExistingSubsubsection = async () => {
      try {
        const existingSubsubsection = await invoke(getSubsubsection, {
          projectSlug,
          subsectionSlug: normalizedResponseSubsectionSlug,
          subsubsectionSlug: normalizedResponseSlug,
        })

        if (isMounted) {
          setExistingSubsubsectionSlug(existingSubsubsection.slug)
        }
      } catch (error) {
        if (!isNotFoundError(error)) {
          if (isMounted) {
            setConvertError("Verknüpfte Maßnahme konnte nicht geprüft werden.")
          }
          return
        }
      } finally {
        if (isMounted) {
          setHasCheckedExistingEntry(true)
        }
      }
    }

    void lookupExistingSubsubsection()

    return () => {
      isMounted = false
    }
  }, [normalizedResponseSlug, normalizedResponseSubsectionSlug, projectSlug])

  const handleConvertToMassnahme = async () => {
    try {
      setConvertError(null)
      setExistingSubsubsectionSlug(null)

      // Look up subsection by commune slug
      let subsection
      try {
        subsection = await invoke(getSubsection, {
          projectSlug,
          subsectionSlug: normalizedResponseSubsectionSlug,
        })
      } catch (error) {
        if (isNotFoundError(error)) {
          throw new Error(
            `Kein Abschnitt mit dem Slug "${normalizedResponseSubsectionSlug}" gefunden. Bitte stellen Sie sicher, dass ein Abschnitt mit diesem Slug im Projekt existiert.`,
          )
        }
        throw error
      }

      // Get category (Fördergegenstand / SubsubsectionInfrastructureType) label from survey response
      const questionCategoryId = getQuestionIdBySurveySlug(surveySlug, "category")
      const responseCategoryValue = response.data[questionCategoryId]
      const responseCategorySlugs = responseCategoryValue || []

      // Resolve all selected Fördergegenstände to infrastructure type ids.
      const { subsubsectionInfrastructureTypes } = await invoke(
        getSubsubsectionInfrastructureTypesWithCount,
        {
          projectSlug,
        },
      )
      const matchingInfrastructureTypes = subsubsectionInfrastructureTypes.filter((infraType) =>
        responseCategorySlugs.includes(infraType.slug),
      )
      const subsubsectionInfrastructureTypeIds = matchingInfrastructureTypes.map(
        (infraType) => infraType.id,
      )

      // Location is `{ lng, lat }` from SwitchableMap (legacy `[lng, lat]` JSON still parses via utils)
      const locationPoint = parseSwitchableMapLocationFieldValue(response.data["location"])
      if (locationPoint == null) {
        throw new Error("Standort (location) fehlt oder ist ungültig.")
      }
      const geometry = point([locationPoint.lng, locationPoint.lat]).geometry

      const description = response.data["stateOfConstruction"]
        ? `${response.data["feedbackText"]}\nStand der Bauvorbereitung: ${response.data["stateOfConstruction"]}`
        : response.data["feedbackText"]

      // Create subsubsection with mapped fields
      const result = await createSubsubsectionMutation({
        projectSlug,
        slug: normalizedResponseSlug,
        type: "POINT",
        geometry,
        description,
        subsectionId: subsection.id,
        isExistingInfra: false,
        labelPos: "top",
        subsubsectionInfrastructureTypeIds,
        estimatedConstructionDateString: response.data["realisationYear"],
        costEstimate: response.data["costs"] ?? null,
        planningCosts: null,
        location: null,
        subTitle: null,
        lengthM: null,
        width: null,
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
        specialFeatures: false,
      })

      // Invalidate the query so it refetches and shows the link
      await invalidateQuery(getSubsubsection, {
        projectSlug,
        subsectionSlug: normalizedResponseSubsectionSlug,
        subsubsectionSlug: result.slug,
      })

      setExistingSubsubsectionSlug(result.slug)
    } catch (error: unknown) {
      console.error("Error converting survey response to subsubsection:", error)
      setConvertError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {/* <FormSuccess message="Maßnahme erfolgreich erstellt" show={isSuccess} /> */}
      {existingSubsubsectionSlug && (
        <Notice type="warn" title="Verknüpfung zur Maßnahmenplanung">
          <p>Aus diesem Beitrag wurde ein Maßnahmeneintrag erstellt.</p>
          <p className="mt-2">
            Verknüpfung sichtbar:{" "}
            <Link
              href={subsubsectionDashboardRoute(
                projectSlug,
                normalizedResponseSubsectionSlug,
                existingSubsubsectionSlug,
              )}
              className={linkStyles}
            >
              Zur Maßnahme
            </Link>
          </p>
        </Notice>
      )}
      {convertError && (
        <div className="rounded-sm bg-red-50 p-4 text-red-800">
          <p className="text-sm">{convertError}</p>
        </div>
      )}
      {!existingSubsubsectionSlug && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleConvertToMassnahme}
            className={blueButtonStyles}
            disabled={isLoading || !hasCheckedExistingEntry}
          >
            {isLoading ? "Wird erstellt..." : "In Maßnahmenplanung überführen"}
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
    ? response.data["commune"].toLowerCase()
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
