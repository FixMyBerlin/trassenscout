"use client"

/**
 * Component for converting a survey response to a subsubsection (Maßnahme).
 *
 * NOTE: This component currently only works for the `ohv-haltestellenfoerderung` survey
 * configuration and needs refinement for other surveys in the future.
 */

import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getQuestionIdBySurveySlug"
import { blueButtonStyles, linkStyles } from "@/src/core/components/links/styles"
import { subsubsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { Prettify } from "@/src/core/types"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import createSubsubsection from "@/src/server/subsubsections/mutations/createSubsubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { invalidateQuery, invoke, useMutation, useQuery } from "@blitzjs/rpc"
import { point } from "@turf/helpers"
import { NotFoundError } from "blitz"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export type ConvertSurveyResponseToSubsubsectionProps = {
  response: Prettify<
    Awaited<
      ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
    >["feedbackSurveyResponses"][number]
  >
  projectSlug: string
  surveySlug: AllowedSurveySlugs
}

export const ConvertSurveyResponseToSubsubsection = ({
  response,
  projectSlug,
  surveySlug,
}: ConvertSurveyResponseToSubsubsectionProps) => {
  const [convertError, setConvertError] = useState<string | null>(null)
  const [createSubsubsectionMutation, { isLoading }] = useMutation(createSubsubsection)
  const router = useRouter()

  // Normalize the slug for the subsubsection
  const normalizedResponseSlug = response.data["subsubsectionId"]
    ? response.data["subsubsectionId"].toLowerCase()
    : null

  const normalizedResponseSubsectionSlug = response.data["commune"]
    ? response.data["commune"].toLowerCase()
    : null

  // Check if subsubsection already exists
  const [subsubsection] = useQuery(
    getSubsubsection,
    {
      projectSlug,
      subsectionSlug: normalizedResponseSubsectionSlug,
      subsubsectionSlug: normalizedResponseSlug,
    },
    {
      suspense: false,
      enabled: Boolean(normalizedResponseSlug && normalizedResponseSubsectionSlug),
    },
  )

  // Determine if subsubsection exists based on query result
  // If we have data, it exists. If error is NotFoundError, it doesn't exist.
  const exists = subsubsection !== undefined

  const handleConvertToMaßnahme = async () => {
    try {
      setConvertError(null)

      // Look up subsection by commune slug
      let subsection
      try {
        subsection = await invoke(getSubsection, {
          projectSlug,
          subsectionSlug: normalizedResponseSubsectionSlug.toLowerCase(),
        })
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new Error(
            `Kein Abschnitt mit dem Slug "${normalizedResponseSubsectionSlug}" gefunden. Bitte stellen Sie sicher, dass ein Abschnitt mit diesem Slug im Projekt existiert.`,
          )
        }
        throw error
      }

      // Get category (Fördergegenstand / SubsubsectionInfrastructureType) label from survey response
      const questionCategoryId = getQuestionIdBySurveySlug(surveySlug, "category")
      const responseCategoryId = response.data[questionCategoryId]

      // Get all SubsubsectionInfrastructureTypes and find matching one by title
      const { subsubsectionInfrastructureTypes } = await invoke(
        getSubsubsectionInfrastructureTypesWithCount,
        {
          projectSlug,
        },
      )
      const matchingInfrastructureType = responseCategoryId
        ? subsubsectionInfrastructureTypes.find(
            (infraType) => infraType.slug === responseCategoryId,
          )
        : null

      // Get project users and find matching user by email
      const projectUsers = await invoke(getProjectUsers, { projectSlug })
      const responseEmail = response.data["email"]
      const matchingUser = responseEmail
        ? projectUsers.find((user) => user.email === responseEmail)
        : null

      // Parse geometry from geometryCategory — extract raw geometry, not the Feature wrapper
      const coordinates = JSON.parse(response.data["geometryCategory"]) as [number, number]
      const geometry = point(coordinates).geometry

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

      router.push(
        subsubsectionDashboardRoute(projectSlug, normalizedResponseSubsectionSlug, result.slug),
      )
    } catch (error: any) {
      console.error("Error converting survey response to subsubsection:", error)
      setConvertError(error.message || "Ein Fehler ist aufgetreten")
    }
  }

  // If subsubsection exists, show link
  if (exists && subsubsection) {
    return (
      <div className="mt-4 flex justify-end">
        <div className="text-sm text-gray-600">
          Diese Meldung wurde bereits als Maßnahme angelegt.{" "}
          <Link
            href={subsubsectionDashboardRoute(
              projectSlug,
              normalizedResponseSubsectionSlug,
              normalizedResponseSlug,
            )}
            className={linkStyles}
          >
            Zur Maßnahme
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      {/* <FormSuccess message="Maßnahme erfolgreich erstellt" show={isSuccess} /> */}
      {convertError && (
        <div className="rounded-sm bg-red-50 p-4 text-red-800">
          <p className="text-sm">{convertError}</p>
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleConvertToMaßnahme}
          className={blueButtonStyles}
          disabled={isLoading}
        >
          {isLoading ? "Wird erstellt..." : "Meldung in Maßnahme überführen"}
        </button>
      </div>
    </div>
  )
}
