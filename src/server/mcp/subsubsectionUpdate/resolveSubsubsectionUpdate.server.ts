import type { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { geometryPreview, geometryVertexIssue } from "@/src/server/mcp/preview/geometryPreview"
import {
  formatPreviewWarning,
  pushChange,
  pushClear,
  type McpPreviewChange,
} from "@/src/server/mcp/preview/previewChange"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { subsubsectionMcpFieldLabel as fieldLabel } from "@/src/server/mcp/subsubsectionUpdate/patchFieldLabel"
import {
  extraFieldKey,
  isExtraFieldPath,
  type SubsubsectionMcpPatch,
} from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"
import {
  resolveSubsubsectionInfrastructureTypeSlugs,
  resolveSubsubsectionRelationSlugs,
} from "@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"
import { GeometryWithTypeSchema } from "@/src/shared/geometry/geometrySchemas"
import { mapGeoTypeToEnum } from "@/src/shared/geometry/mapGeoTypeToEnum"
import { setIds } from "@/src/shared/prisma/connectIds"
import {
  parseDefinitions,
  parseExtraFields,
  sanitizeExtraFieldsForSave,
} from "@/src/shared/subsubsections/extraFieldSchemas"
const SCALAR_KEYS = [
  "description",
  "location",
  "lengthM",
  "width",
  "costEstimate",
  "isExistingInfra",
  "maxSpeed",
  "trafficLoad",
  "trafficLoadDate",
  "planningPeriod",
  "constructionPeriod",
  "estimatedCompletionDate",
  "estimatedConstructionDateString",
  "planningCosts",
  "deliveryCosts",
  "constructionCosts",
  "landAcquisitionCosts",
  "expensesOfficialOrders",
  "expensesTechnicalVerification",
  "nonEligibleExpenses",
  "grantAmount",
  "ownFunds",
  "grantsOtherFunding",
  "revenuesEconomicIncome",
  "contributionsThirdParties",
  "remainingFunding",
  "disbursedFunding",
] as const satisfies readonly (keyof SubsubsectionMcpPatch)[]

export type ResolveSubsubsectionUpdateResult = {
  environment: ReturnType<typeof mcpEnvLabel>
  mcpMode: Awaited<ReturnType<typeof requireMcpEnabledProject>>["mcpMode"]
  url: string
  okToWrite: boolean
  changes: McpPreviewChange[]
  errors: string[]
  warnings: string[]
  prismaData: Prisma.SubsubsectionUpdateInput
  subsubsectionId: number
  projectSlug: string
  subsectionSlug: string
  slug: string
  previousSnapshot: ReturnType<typeof subsubsectionLogSnapshot> & { id: number }
  projectId: number
}

export async function resolveSubsubsectionUpdate({
  projectSlug,
  subsectionSlug,
  slug,
  patch,
  origin,
}: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpPatch
  origin: string
}): Promise<ResolveSubsubsectionUpdateResult> {
  const project = await requireMcpEnabledProject(projectSlug)
  const environment = mcpEnvLabel(process.env.VITE_APP_ENV)
  const errors: string[] = []

  const subsubsection = await db.subsubsection.findFirst({
    where: {
      slug,
      subsection: { slug: subsectionSlug, projectId: project.id },
    },
    select: {
      id: true,
      ...subsubsectionLogSnapshotSelect,
      qualityLevel: { select: { slug: true } },
      SubsubsectionStatus: { select: { slug: true } },
      SubsubsectionTask: { select: { slug: true } },
      SubsubsectionInfra: { select: { slug: true } },
      SubsubsectionInfrastructureTypes: { select: { slug: true, id: true } },
      subsection: { select: { slug: true } },
    },
  })

  if (!subsubsection) {
    throw new Error(`Subsubsection (Maßnahme) not found: ${projectSlug}/${subsectionSlug}/${slug}`)
  }

  const url = buildSubsubsectionUrl(
    origin,
    project.slug,
    subsubsection.subsection.slug,
    subsubsection.slug,
  )
  const definitions = parseDefinitions(project.subsubsectionExtraFieldDefinitions)
  const currentExtraFields = parseExtraFields(subsubsection.extraFields)
  const prismaData: Prisma.SubsubsectionUpdateInput = {}
  const changes: McpPreviewChange[] = []
  const geometryWarnings: string[] = []

  if (patch.geometry !== undefined) {
    // A Maßnahme ohne Geometrie takes its type from the first geometry it gets
    const type = subsubsection.type ?? mapGeoTypeToEnum(patch.geometry.type)
    const matched = GeometryWithTypeSchema.safeParse({ type, geometry: patch.geometry })
    if (!matched.success) {
      errors.push(
        "geometry passt nicht zum gespeicherten Typ (POINT/LINE/POLYGON müssen zum GeoJSON-Typ passen).",
      )
    } else {
      const vertexIssue = geometryVertexIssue(patch.geometry)
      if (vertexIssue.error) {
        errors.push(vertexIssue.error)
      } else {
        if (vertexIssue.warning) geometryWarnings.push(vertexIssue.warning)
        pushChange(
          changes,
          fieldLabel,
          "geometry",
          subsubsection.geometry,
          geometryPreview(patch.geometry),
        )
        prismaData.geometry = patch.geometry as Prisma.InputJsonValue
        if (subsubsection.type === null) {
          pushChange(changes, fieldLabel, "type", null, type)
          prismaData.type = type
        }
      }
    }
  }

  // Checked before any change is recorded so the preview never shows a rejected value
  const clearFields = new Set(patch.clear)
  const conflictingFields = new Set<string>()
  for (const field of clearFields) {
    const inPatch = isExtraFieldPath(field)
      ? patch.extraFields?.[extraFieldKey(field)] !== undefined
      : patch[field] !== undefined
    if (!inPatch) continue
    conflictingFields.add(field)
    errors.push(
      `${fieldLabel(field)} (${field}): send it either in the patch or in clear, not both.`,
    )
  }
  const clearNotes: string[] = []

  for (const key of SCALAR_KEYS) {
    if (!(key in patch) || patch[key] === undefined || conflictingFields.has(key)) continue
    const proposed = patch[key]
    if (proposed === null) {
      errors.push(
        `${fieldLabel(key)} (${key}): MCP rejects null. Omit the key to leave the value unchanged.`,
      )
      continue
    }
    const proposedValue =
      key === "trafficLoadDate" || key === "estimatedCompletionDate"
        ? new Date(proposed as string)
        : proposed
    if (
      !pushChange(
        changes,
        fieldLabel,
        key,
        subsubsection[key as keyof typeof subsubsection],
        proposedValue,
      )
    )
      continue
    ;(prismaData as Record<string, unknown>)[key] = proposedValue
  }

  const clearExtraFieldKeys: string[] = []
  for (const field of clearFields) {
    if (conflictingFields.has(field)) continue
    if (isExtraFieldPath(field)) {
      clearExtraFieldKeys.push(extraFieldKey(field))
      continue
    }
    if (pushClear(changes, clearNotes, fieldLabel, field, subsubsection[field])) {
      prismaData[field] = null
    }
  }

  const relationSlugs = {
    qualityLevelSlug: patch.qualityLevelSlug,
    subsubsectionStatusSlug: patch.subsubsectionStatusSlug,
    subsubsectionInfraSlug: patch.subsubsectionInfraSlug,
    subsubsectionTaskSlug: patch.subsubsectionTaskSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    try {
      const resolved = await resolveSubsubsectionRelationSlugs({
        projectId: project.id,
        slugs: relationSlugs,
        missing: "error",
      })
      if (patch.qualityLevelSlug !== undefined && resolved.qualityLevelId !== undefined) {
        if (
          pushChange(
            changes,
            fieldLabel,
            "qualityLevelSlug",
            subsubsection.qualityLevel?.slug ?? null,
            patch.qualityLevelSlug,
          )
        ) {
          prismaData.qualityLevel = { connect: { id: resolved.qualityLevelId } }
        }
      }
      if (
        patch.subsubsectionStatusSlug !== undefined &&
        resolved.subsubsectionStatusId !== undefined
      ) {
        if (
          pushChange(
            changes,
            fieldLabel,
            "subsubsectionStatusSlug",
            subsubsection.SubsubsectionStatus?.slug ?? null,
            patch.subsubsectionStatusSlug,
          )
        ) {
          prismaData.SubsubsectionStatus = { connect: { id: resolved.subsubsectionStatusId } }
        }
      }
      if (patch.subsubsectionTaskSlug !== undefined && resolved.subsubsectionTaskId !== undefined) {
        if (
          pushChange(
            changes,
            fieldLabel,
            "subsubsectionTaskSlug",
            subsubsection.SubsubsectionTask?.slug ?? null,
            patch.subsubsectionTaskSlug,
          )
        ) {
          prismaData.SubsubsectionTask = { connect: { id: resolved.subsubsectionTaskId } }
        }
      }
      if (
        patch.subsubsectionInfraSlug !== undefined &&
        resolved.subsubsectionInfraId !== undefined
      ) {
        if (
          pushChange(
            changes,
            fieldLabel,
            "subsubsectionInfraSlug",
            subsubsection.SubsubsectionInfra?.slug ?? null,
            patch.subsubsectionInfraSlug,
          )
        ) {
          prismaData.SubsubsectionInfra = { connect: { id: resolved.subsubsectionInfraId } }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (patch.subsubsectionInfrastructureTypeSlugs !== undefined) {
    try {
      const ids = await resolveSubsubsectionInfrastructureTypeSlugs({
        projectId: project.id,
        slugs: patch.subsubsectionInfrastructureTypeSlugs,
        missing: "error",
      })
      const currentSlugs = subsubsection.SubsubsectionInfrastructureTypes.map((row) => row.slug)
      if (
        pushChange(
          changes,
          fieldLabel,
          "subsubsectionInfrastructureTypeSlugs",
          currentSlugs,
          patch.subsubsectionInfrastructureTypeSlugs,
        )
      ) {
        prismaData.SubsubsectionInfrastructureTypes = setIds(ids)
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (patch.extraFields !== undefined || clearExtraFieldKeys.length > 0) {
    const allowed = new Set(definitions.map((definition) => definition.name))
    const merged = { ...currentExtraFields }
    let extraFieldsDirty = false
    for (const [key, value] of Object.entries(patch.extraFields ?? {})) {
      if (!allowed.has(key)) {
        errors.push(`Unknown extraFields key: "${key}"`)
        continue
      }
      if (conflictingFields.has(`extraFields.${key}`)) continue
      if (value.trim() === "") {
        errors.push(
          `extraFields.${key}: MCP rejects empty strings. To reset it, send clear: ["extraFields.${key}"].`,
        )
        continue
      }
      if (
        pushChange(
          changes,
          fieldLabel,
          `extraFields.${key}`,
          currentExtraFields[key] ?? null,
          value,
        )
      ) {
        merged[key] = value
        extraFieldsDirty = true
      }
    }
    for (const key of clearExtraFieldKeys) {
      if (!allowed.has(key)) {
        errors.push(`Unknown extraFields key in clear: "${key}"`)
        continue
      }
      if (
        pushClear(changes, clearNotes, fieldLabel, `extraFields.${key}`, currentExtraFields[key])
      ) {
        delete merged[key]
        extraFieldsDirty = true
      }
    }
    if (extraFieldsDirty) {
      prismaData.extraFields = sanitizeExtraFieldsForSave(
        merged,
        definitions,
      ) as Prisma.InputJsonValue
    }
  }

  const warnings = [
    ...changes.filter((change) => change.kind !== "set").map(formatPreviewWarning),
    ...clearNotes,
    ...geometryWarnings,
  ]

  return {
    environment,
    mcpMode: project.mcpMode,
    url,
    okToWrite: errors.length === 0 && changes.length > 0,
    changes,
    errors,
    warnings,
    prismaData,
    subsubsectionId: subsubsection.id,
    projectSlug: project.slug,
    subsectionSlug: subsubsection.subsection.slug,
    slug: subsubsection.slug,
    previousSnapshot: { id: subsubsection.id, ...subsubsectionLogSnapshot(subsubsection) },
    projectId: project.id,
  }
}

export function subsubsectionPreviewPayload(result: ResolveSubsubsectionUpdateResult) {
  return {
    environment: result.environment,
    url: result.url,
    projectSlug: result.projectSlug,
    subsectionSlug: result.subsectionSlug,
    slug: result.slug,
    okToWrite: result.okToWrite,
    changes: result.changes,
    errors: result.errors,
    warnings: result.warnings,
  }
}
