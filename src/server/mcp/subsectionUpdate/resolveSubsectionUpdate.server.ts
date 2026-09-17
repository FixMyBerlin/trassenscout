import type { Prisma } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { subsectionMcpFieldLabel } from "@/src/server/mcp/subsectionUpdate/patchFieldLabel"
import type { SubsectionMcpPatch } from "@/src/server/mcp/subsectionUpdate/patchSchema"
import { buildSubsectionUrl } from "@/src/server/mcp/subsectionUrl"
import {
  formatPreviewWarning,
  isEmptyCurrentValue,
  valuesEqual,
  type SubsubsectionPreviewChange,
} from "@/src/server/mcp/subsubsectionUpdate/formatPreview"
import { resolveSubsectionRelationSlugs } from "@/src/server/subsections/resolveSubsectionRelationSlugs.server"

const SCALAR_KEYS = [
  "description",
  "lengthM",
  "estimatedCompletionDateString",
] as const satisfies readonly (keyof SubsectionMcpPatch)[]

function fieldLabel(field: string) {
  return subsectionMcpFieldLabel(field)
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

export type ResolveSubsectionUpdateResult = {
  environment: ReturnType<typeof mcpEnvLabel>
  url: string
  okToWrite: boolean
  changes: SubsubsectionPreviewChange[]
  errors: string[]
  warnings: string[]
  prismaData: Prisma.SubsectionUpdateInput
  subsectionId: number
  projectSlug: string
  slug: string
  projectId: number
}

export async function resolveSubsectionUpdate({
  projectSlug,
  slug,
  patch,
  origin,
}: {
  projectSlug: string
  slug: string
  patch: SubsectionMcpPatch
  origin: string
}): Promise<ResolveSubsectionUpdateResult> {
  const project = await requireMcpEnabledProject(projectSlug)
  const environment = mcpEnvLabel(process.env.VITE_APP_ENV)
  const errors: string[] = []

  const subsection = await db.subsection.findFirst({
    where: { slug, projectId: project.id },
    select: {
      id: true,
      slug: true,
      description: true,
      lengthM: true,
      estimatedCompletionDateString: true,
      operator: { select: { slug: true } },
      networkHierarchy: { select: { slug: true } },
      SubsectionStatus: { select: { slug: true } },
    },
  })

  if (!subsection) {
    throw new Error(`Subsection (Planungsabschnitt) not found: ${projectSlug}/${slug}`)
  }

  const url = buildSubsectionUrl(origin, project.slug, subsection.slug)
  const prismaData: Prisma.SubsectionUpdateInput = {}
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
    if (!pushChange(changes, key, subsection[key], proposed)) continue
    ;(prismaData as Record<string, unknown>)[key] = proposed
  }

  const relationSlugs = {
    operatorSlug: patch.operatorSlug,
    networkHierarchySlug: patch.networkHierarchySlug,
    subsectionStatusSlug: patch.subsectionStatusSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    try {
      const resolved = await resolveSubsectionRelationSlugs({
        projectId: project.id,
        slugs: relationSlugs,
        missing: "error",
      })
      if (patch.operatorSlug !== undefined && resolved.operatorId !== undefined) {
        if (
          pushChange(changes, "operatorSlug", subsection.operator?.slug ?? null, patch.operatorSlug)
        ) {
          prismaData.operator = { connect: { id: resolved.operatorId } }
        }
      }
      if (patch.networkHierarchySlug !== undefined && resolved.networkHierarchyId !== undefined) {
        if (
          pushChange(
            changes,
            "networkHierarchySlug",
            subsection.networkHierarchy?.slug ?? null,
            patch.networkHierarchySlug,
          )
        ) {
          prismaData.networkHierarchy = { connect: { id: resolved.networkHierarchyId } }
        }
      }
      if (patch.subsectionStatusSlug !== undefined && resolved.subsectionStatusId !== undefined) {
        if (
          pushChange(
            changes,
            "subsectionStatusSlug",
            subsection.SubsectionStatus?.slug ?? null,
            patch.subsectionStatusSlug,
          )
        ) {
          prismaData.SubsectionStatus = { connect: { id: resolved.subsectionStatusId } }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
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
    subsectionId: subsection.id,
    projectSlug: project.slug,
    slug: subsection.slug,
    projectId: project.id,
  }
}

export function subsectionPreviewPayload(result: ResolveSubsectionUpdateResult) {
  return {
    environment: result.environment,
    url: result.url,
    projectSlug: result.projectSlug,
    slug: result.slug,
    okToWrite: result.okToWrite,
    changes: result.changes,
    errors: result.errors,
    warnings: result.warnings,
  }
}
