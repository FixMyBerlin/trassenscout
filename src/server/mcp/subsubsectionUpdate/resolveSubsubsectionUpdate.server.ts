import type { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import {
  formatPreviewWarning,
  isEmptyCurrentValue,
  valuesEqual,
  type SubsubsectionPreviewChange,
} from "@/src/server/mcp/subsubsectionUpdate/formatPreview"
import { subsubsectionMcpFieldLabel } from "@/src/server/mcp/subsubsectionUpdate/patchFieldLabel"
import type { SubsubsectionMcpPatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import { buildSubsubsectionUrl } from "@/src/server/mcp/subsubsectionUrl"
import {
  resolveSubsubsectionInfrastructureTypeSlugs,
  resolveSubsubsectionRelationSlugs,
} from "@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server"
import {
  subsubsectionLogSnapshot,
  subsubsectionLogSnapshotSelect,
} from "@/src/server/subsubsections/subsubsectionLogSnapshot"
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
  "revenuesEconomicIncome",
  "contributionsThirdParties",
  "grantsOtherFunding",
  "ownFunds",
] as const satisfies readonly (keyof SubsubsectionMcpPatch)[]

function fieldLabel(field: string) {
  return subsubsectionMcpFieldLabel(field)
}

function pushChange(
  changes: SubsubsectionPreviewChange[],
  field: string,
  current: unknown,
  proposed: unknown,
): boolean {
  if (valuesEqual(current, proposed)) return false
  changes.push({
    field,
    label: fieldLabel(field),
    kind: isEmptyCurrentValue(current) ? "set" : "overwrite",
    proposed,
  })
  return true
}

export type ResolveSubsubsectionUpdateResult = {
  environment: ReturnType<typeof mcpEnvLabel>
  url: string
  okToWrite: boolean
  changes: SubsubsectionPreviewChange[]
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
  const changes: SubsubsectionPreviewChange[] = []

  for (const key of SCALAR_KEYS) {
    if (!(key in patch) || patch[key] === undefined) continue
    const proposed = patch[key]
    if (proposed === null) {
      errors.push(
        `${fieldLabel(key)} (${key}): MCP cannot clear fields with null. Omit the key to leave the value unchanged.`,
      )
      continue
    }
    const proposedValue =
      key === "trafficLoadDate" || key === "estimatedCompletionDate"
        ? new Date(proposed as string)
        : proposed
    if (!pushChange(changes, key, subsubsection[key as keyof typeof subsubsection], proposedValue))
      continue
    ;(prismaData as Record<string, unknown>)[key] = proposedValue
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

  if (patch.extraFields !== undefined) {
    const allowed = new Set(definitions.map((definition) => definition.name))
    const merged = { ...currentExtraFields }
    let extraFieldsDirty = false
    for (const [key, value] of Object.entries(patch.extraFields)) {
      if (!allowed.has(key)) {
        errors.push(`Unknown extraFields key: "${key}"`)
        continue
      }
      if (value.trim() === "") {
        errors.push(
          `extraFields.${key}: MCP cannot clear fields with empty string. Omit the key to leave the value unchanged.`,
        )
        continue
      }
      if (pushChange(changes, `extraFields.${key}`, currentExtraFields[key] ?? null, value)) {
        merged[key] = value
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

  const warnings = changes.filter((change) => change.kind === "overwrite").map(formatPreviewWarning)

  return {
    environment,
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
