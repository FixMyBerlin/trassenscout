import type { GeometryTypeEnum, LocationEnum } from "@/src/prisma/generated/browser"
import {
  resolveSubsubsectionInfrastructureTypeSlugs,
  resolveSubsubsectionRelationSlugs,
} from "@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"
import {
  parseDefinitions,
  sanitizeExtraFieldsForSave,
} from "@/src/shared/subsubsections/extraFieldSchemas"
import type { SubsubsectionMcpPatch } from "./patchSchema"
import { subsubsectionMcpPatchOverlaySchema } from "./patchSchema"

const SCALAR_FORM_KEYS = [
  "description",
  "location",
  "lengthM",
  "width",
  "costEstimate",
  "isExistingInfra",
  "maxSpeed",
  "trafficLoad",
  "planningPeriod",
  "constructionPeriod",
  "estimatedConstructionDateString",
  "planningCosts",
  "deliveryCosts",
  "constructionCosts",
  "landAcquisitionCosts",
  "expensesOfficialOrders",
  "expensesTechnicalVerification",
  "nonEligibleExpenses",
  "revenuesEconomicIncome",
  "contributionsThirdParties",
  "grantsOtherFunding",
  "ownFunds",
] as const satisfies readonly (keyof SubsubsectionMcpPatch)[]

export type SubsubsectionMcpFormOverlay = {
  slug?: string
  type?: GeometryTypeEnum
  geometry?: SupportedGeometry
  description?: string
  location?: LocationEnum | ""
  lengthM?: number
  width?: number
  costEstimate?: number
  isExistingInfra?: boolean
  maxSpeed?: number
  trafficLoad?: number
  trafficLoadDate?: string
  planningPeriod?: number
  constructionPeriod?: number
  estimatedCompletionDate?: string
  estimatedConstructionDateString?: string
  planningCosts?: number
  deliveryCosts?: number
  constructionCosts?: number
  landAcquisitionCosts?: number
  expensesOfficialOrders?: number
  expensesTechnicalVerification?: number
  nonEligibleExpenses?: number
  revenuesEconomicIncome?: number
  contributionsThirdParties?: number
  grantsOtherFunding?: number
  ownFunds?: number
  qualityLevelId?: number
  subsubsectionStatusId?: number
  subsubsectionTaskId?: number
  subsubsectionInfraId?: number
  subsubsectionInfrastructureTypeIds?: string[]
  extraFields?: Record<string, string>
}

function dateToFormString(value: Date | string) {
  if (value instanceof Date) return value.toISOString().split("T")[0] ?? ""
  return value.slice(0, 10)
}

export async function overlaySubsubsectionMcpDraft({
  patch,
  extraFieldDefinitions,
  projectId,
  currentExtraFields,
}: {
  patch: unknown
  extraFieldDefinitions: unknown
  projectId: number
  currentExtraFields: Record<string, string>
}): Promise<SubsubsectionMcpFormOverlay> {
  const parsed = subsubsectionMcpPatchOverlaySchema.safeParse(patch)
  if (!parsed.success) return {}

  const overlayPatch = parsed.data
  const overlay: SubsubsectionMcpFormOverlay = {}
  const definitions = parseDefinitions(extraFieldDefinitions)

  if (overlayPatch.type !== undefined) overlay.type = overlayPatch.type
  if (overlayPatch.geometry !== undefined) overlay.geometry = overlayPatch.geometry

  for (const key of SCALAR_FORM_KEYS) {
    if (!(key in overlayPatch) || overlayPatch[key] === undefined) continue
    const value = overlayPatch[key]
    if (key === "location") {
      overlay.location = value as LocationEnum
      continue
    }
    ;(overlay as Record<string, unknown>)[key] = value
  }

  if (overlayPatch.trafficLoadDate) {
    overlay.trafficLoadDate = dateToFormString(overlayPatch.trafficLoadDate)
  }
  if (overlayPatch.estimatedCompletionDate) {
    overlay.estimatedCompletionDate = dateToFormString(overlayPatch.estimatedCompletionDate)
  }

  const relationSlugs = {
    qualityLevelSlug: overlayPatch.qualityLevelSlug,
    subsubsectionStatusSlug: overlayPatch.subsubsectionStatusSlug,
    subsubsectionInfraSlug: overlayPatch.subsubsectionInfraSlug,
    subsubsectionTaskSlug: overlayPatch.subsubsectionTaskSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    const resolved = await resolveSubsubsectionRelationSlugs({
      projectId,
      slugs: relationSlugs,
      missing: "error",
    })
    if (overlayPatch.qualityLevelSlug !== undefined) {
      overlay.qualityLevelId = resolved.qualityLevelId
    }
    if (overlayPatch.subsubsectionStatusSlug !== undefined) {
      overlay.subsubsectionStatusId = resolved.subsubsectionStatusId
    }
    if (overlayPatch.subsubsectionTaskSlug !== undefined) {
      overlay.subsubsectionTaskId = resolved.subsubsectionTaskId
    }
    if (overlayPatch.subsubsectionInfraSlug !== undefined) {
      overlay.subsubsectionInfraId = resolved.subsubsectionInfraId
    }
  }

  if (overlayPatch.subsubsectionInfrastructureTypeSlugs !== undefined) {
    const ids = await resolveSubsubsectionInfrastructureTypeSlugs({
      projectId,
      slugs: overlayPatch.subsubsectionInfrastructureTypeSlugs,
      missing: "error",
    })
    overlay.subsubsectionInfrastructureTypeIds = ids.map(String)
  }

  if (overlayPatch.extraFields !== undefined) {
    const sanitized = sanitizeExtraFieldsForSave(overlayPatch.extraFields, definitions)
    if (Object.keys(sanitized).length > 0) {
      overlay.extraFields = { ...currentExtraFields, ...sanitized }
    }
  }

  return overlay
}
