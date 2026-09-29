/**
 * OHV-only: survey response → subsubsection for `ohv-haltestellenfoerderung` in project `ohv`.
 */

import { LinkIcon } from "@heroicons/react/24/outline"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { point } from "@turf/helpers"
import { useState } from "react"
import { parseSwitchableMapLocationFieldValue } from "@/src/components/beteiligung/form/map/utils"
import { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getQuestionIdBySurveySlug } from "@/src/components/beteiligung/shared/utils/getQuestionIdBySurveySlug"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { Link } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Prettify } from "@/src/components/core/types"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"
import { adminLookupRowsQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { createProjectRecordFn } from "@/src/server/projectRecords/projectRecords.functions"
import { getSubsectionBySlugFn } from "@/src/server/subsections/subsections.functions"
import {
  createSubsubsectionFn,
  getSubsubsectionBySlugFn,
} from "@/src/server/subsubsections/subsubsections.functions"
import type { CreateSubsubsectionInput } from "@/src/server/subsubsections/subsubsections.inputSchemas"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"

export type ConvertSurveyResponseToSubsubsectionOhvProps = {
  response: Prettify<FeedbackSurveyResponse>
  projectSlug: string
  surveySlug: AllowedSurveySlugs
}

type ConvertSurveyResponseToSubsubsectionOhvFormProps =
  ConvertSurveyResponseToSubsubsectionOhvProps & {
    subsubsectionSlug: string
    subsectionSlug: string
  }

const isNotFoundError = (error: unknown) => {
  const candidate = error as { name?: string; code?: string; message?: string } | null
  return (
    candidate?.name === "NotFoundError" ||
    candidate?.code === "P2025" ||
    candidate?.message === "No Subsubsection found"
  )
}

const ConvertSurveyResponseToSubsubsectionOhvForm = ({
  response,
  projectSlug,
  surveySlug,
  subsubsectionSlug,
  subsectionSlug,
}: ConvertSurveyResponseToSubsubsectionOhvFormProps) => {
  const queryClient = useQueryClient()
  const userCanEdit = useUserCan().edit
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertedSubsubsectionSlug, setConvertedSubsubsectionSlug] = useState<string | null>(null)
  const createSubsubsectionMutation = useMutation({ mutationFn: createSubsubsectionFn })
  const createProjectRecordMutation = useMutation({ mutationFn: createProjectRecordFn })

  const existingSubsubsectionLookup = useQuery({
    queryKey: ["subsubsectionBySlug", projectSlug, subsectionSlug, subsubsectionSlug],
    queryFn: async () => {
      try {
        return await getSubsubsectionBySlugFn({
          data: {
            projectSlug,
            subsectionSlug,
            subsubsectionSlug,
          },
        })
      } catch (error) {
        if (isNotFoundError(error)) return null
        console.error("Failed to check for existing subsubsection:", error)
        return null
      }
    },
  })

  const existingSubsubsectionSlug =
    convertedSubsubsectionSlug ?? existingSubsubsectionLookup.data?.slug ?? null
  const hasCheckedExistingEntry = existingSubsubsectionLookup.isFetched

  const handleConvertToSubsubsection = async () => {
    try {
      setConvertError(null)
      setConvertedSubsubsectionSlug(null)

      let subsection
      try {
        subsection = await getSubsectionBySlugFn({
          data: {
            projectSlug,
            subsectionSlug,
          },
        })
      } catch (error) {
        if (isNotFoundError(error)) {
          throw new Error(
            `Kein Abschnitt mit dem Slug "${subsectionSlug}" gefunden. Bitte stellen Sie sicher, dass ein Abschnitt mit diesem Slug im Projekt existiert.`,
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
        ? `${String(response.data["feedbackText"] ?? "")}\n\nStand der Bauvorbereitung:\n${String(response.data["stateOfConstruction"])}`
        : String(response.data["feedbackText"] ?? "")

      const createInput: CreateSubsubsectionInput = {
        projectSlug,
        slug: subsubsectionSlug,
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
        grantAmount: null,
        ownFunds: null,
        grantsOtherFunding: null,
        revenuesEconomicIncome: null,
        contributionsThirdParties: null,
        remainingFunding: null,
        disbursedFunding: null,
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
      try {
        await createProjectRecordMutation.mutateAsync({
          data: {
            projectSlug,
            title: "Maßnahme aus Eingabe erstellt",
            body: `Maßnahme wurde aus [Eingabe ${response.id}](/${projectSlug}/surveys/${response.surveySession.survey.id}/responses?responseDetails=${response.id}) erstellt.`,
            subsubsections: [result.id],
            editingState: ProjectRecordEditingState.COMPLETED,
            // The conversion happened today; the form uses "" for "no date", which would leave
            // the entry unsorted in the date-ordered Protokoll list.
            date: new Date().toISOString().slice(0, 10),
            subsubsectionId: null,
            acquisitionAreaId: null,
            assignedToId: null,
            acquisitionAreas: [],
            formTemplates: [],
            tags: [],
            uploads: [],
            projectRecordTemplateId: null,
          },
        })
        await queryClient.invalidateQueries({ queryKey: ["projectRecords"] })
      } catch (error: unknown) {
        console.error("Failed to create the project record for the converted subsubsection:", error)
        setConvertError(
          "Die Maßnahme wurde erstellt, der automatische Protokolleintrag konnte aber nicht angelegt werden.",
        )
      }
    } catch (error: unknown) {
      console.error("Error converting survey response to subsubsection:", error)
      setConvertError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {existingSubsubsectionSlug && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-5">
          <div className="mb-3 flex items-center gap-3">
            <LinkIcon className="size-5 shrink-0 text-blue-700" aria-hidden="true" />
            <h4 className="font-semibold">Verknüpfte Maßnahme</h4>
          </div>

          <p className="text-sm text-gray-700">
            Diese Eingabe wurde in eine Maßnahme überführt:{" "}
            <Link
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
              params={{
                projectSlug,
                subsectionSlug,
                subsubsectionSlug: existingSubsubsectionSlug,
              }}
              className={linkStyles}
            >
              Maßnahme öffnen
            </Link>
          </p>
        </div>
      )}
      {convertError && (
        <div className="rounded-sm bg-red-50 p-4 text-red-800">
          <p className="text-sm">{convertError}</p>
        </div>
      )}
      {!existingSubsubsectionSlug && userCanEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleConvertToSubsubsection}
            className={primaryButtonClassName}
            disabled={createSubsubsectionMutation.isPending || !hasCheckedExistingEntry}
          >
            {createSubsubsectionMutation.isPending ? "Wird erstellt..." : "In Maßnahme überführen"}
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
}: ConvertSurveyResponseToSubsubsectionOhvProps) => {
  const subsubsectionSlug =
    typeof response.data["referenceId"] === "string"
      ? response.data["referenceId"].toLowerCase()
      : null

  const subsectionSlug = response.data["commune"]
    ? String(response.data["commune"]).toLowerCase()
    : null

  if (projectSlug !== "ohv") {
    return null
  }

  if (!subsubsectionSlug || !subsectionSlug) {
    return null
  }

  return (
    <ConvertSurveyResponseToSubsubsectionOhvForm
      response={response}
      projectSlug={projectSlug}
      surveySlug={surveySlug}
      subsubsectionSlug={subsubsectionSlug}
      subsectionSlug={subsectionSlug}
    />
  )
}
