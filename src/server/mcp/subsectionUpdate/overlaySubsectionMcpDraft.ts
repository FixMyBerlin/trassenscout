import type { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import { resolveSubsectionRelationSlugs } from "@/src/server/subsections/resolveSubsectionRelationSlugs.server"
import type { SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"
import type { SubsectionMcpCreatePatch, SubsectionMcpPatch } from "./patchSchema"
import {
  subsectionMcpCreatePatchOverlaySchema,
  subsectionMcpPatchOverlaySchema,
} from "./patchSchema"

const SCALAR_FORM_KEYS = [
  "description",
  "lengthM",
  "estimatedCompletionDateString",
] as const satisfies readonly (keyof SubsectionMcpPatch)[]

type SubsectionMcpFormOverlay = {
  slug?: string
  type?: GeometryTypeEnum
  geometry?: SupportedGeometry
  description?: string
  lengthM?: number
  estimatedCompletionDateString?: string
  operatorId?: number
  networkHierarchyId?: number
  subsectionStatusId?: number
}

export type SubsectionMcpFormOverlayResult = {
  overlay: SubsectionMcpFormOverlay
  overlayErrors: string[]
}

export async function overlaySubsectionMcpDraft({
  patch,
  projectId,
  createDraft = false,
}: {
  patch: unknown
  projectId: number
  createDraft?: boolean
}): Promise<SubsectionMcpFormOverlayResult> {
  const schema = createDraft
    ? subsectionMcpCreatePatchOverlaySchema
    : subsectionMcpPatchOverlaySchema
  const parsed = schema.safeParse(patch)
  if (!parsed.success) return { overlay: {}, overlayErrors: [] }

  const overlayPatch = parsed.data
  const overlay: SubsectionMcpFormOverlay = {}
  const overlayErrors: string[] = []

  if (createDraft) {
    const createPatch = overlayPatch as SubsectionMcpCreatePatch
    if (createPatch.type !== undefined) overlay.type = createPatch.type
    if (createPatch.geometry !== undefined) overlay.geometry = createPatch.geometry
  }

  for (const key of SCALAR_FORM_KEYS) {
    if (!(key in overlayPatch) || overlayPatch[key] === undefined) continue
    ;(overlay as Record<string, unknown>)[key] = overlayPatch[key]
  }

  const relationSlugs = {
    operatorSlug: overlayPatch.operatorSlug,
    networkHierarchySlug: overlayPatch.networkHierarchySlug,
    subsectionStatusSlug: overlayPatch.subsectionStatusSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    try {
      const resolved = await resolveSubsectionRelationSlugs({
        projectId,
        slugs: relationSlugs,
        missing: "error",
      })
      if (overlayPatch.operatorSlug !== undefined) {
        overlay.operatorId = resolved.operatorId
      }
      if (overlayPatch.networkHierarchySlug !== undefined) {
        overlay.networkHierarchyId = resolved.networkHierarchyId
      }
      if (overlayPatch.subsectionStatusSlug !== undefined) {
        overlay.subsectionStatusId = resolved.subsectionStatusId
      }
    } catch (error) {
      overlayErrors.push(error instanceof Error ? error.message : String(error))
    }
  }

  return { overlay, overlayErrors }
}
