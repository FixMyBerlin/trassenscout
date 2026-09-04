import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import db from "@/src/server/db.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import type { SubsubsectionPreviewChange } from "@/src/server/mcp/subsubsectionUpdate/formatPreview"
import {
  countGeometryVertices,
  geometryPreview,
  MCP_GEOMETRY_MAX_VERTICES,
  MCP_GEOMETRY_WARN_VERTICES,
} from "@/src/server/mcp/subsubsectionUpdate/geometryPreview"
import { subsubsectionMcpFieldLabel } from "@/src/server/mcp/subsubsectionUpdate/patchFieldLabel"
import type { SubsubsectionMcpCreatePatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import {
  resolveSubsubsectionInfrastructureTypeSlugs,
  resolveSubsubsectionRelationSlugs,
} from "@/src/server/subsubsections/resolveSubsubsectionRelationSlugs.server"
import { GeometryWithTypeSchema } from "@/src/shared/geometry/geometrySchemas"
import { parseDefinitions } from "@/src/shared/subsubsections/extraFieldSchemas"

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
] as const satisfies readonly (keyof SubsubsectionMcpCreatePatch)[]

function fieldLabel(field: string) {
  return subsubsectionMcpFieldLabel(field)
}

function pushSet(changes: SubsubsectionPreviewChange[], field: string, proposed: unknown) {
  changes.push({ field, label: fieldLabel(field), kind: "set", proposed })
}

type SubsubsectionMcpSlugConflict = {
  kind: "measure" | "createDraft"
  url: string
}

export type ResolveSubsubsectionCreateResult = {
  environment: ReturnType<typeof mcpEnvLabel>
  url: string
  okToWrite: boolean
  changes: SubsubsectionPreviewChange[]
  errors: string[]
  warnings: string[]
  missingRequired: string[]
  slugConflict: SubsubsectionMcpSlugConflict | null
  subsectionId: number
  projectSlug: string
  subsectionSlug: string
  slug: string
  projectId: number
}

function buildNewFormUrl(
  origin: string,
  projectSlug: string,
  subsectionSlug: string,
  slug: string,
) {
  const url = new URL(`/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/new`, origin)
  url.searchParams.set("mcpDraft", "true")
  url.searchParams.set("slug", slug)
  return url.href
}

export async function resolveSubsubsectionCreate({
  projectSlug,
  subsectionSlug,
  slug,
  patch,
  origin,
}: {
  projectSlug: string
  subsectionSlug: string
  slug: string
  patch: SubsubsectionMcpCreatePatch
  origin: string
}): Promise<ResolveSubsubsectionCreateResult> {
  const project = await requireMcpEnabledProject(projectSlug)
  const environment = mcpEnvLabel(process.env.VITE_APP_ENV)
  const errors: string[] = []
  const warnings: string[] = []
  const missingRequired: string[] = []
  const changes: SubsubsectionPreviewChange[] = []

  const slugParsed = SlugSchema.safeParse(slug)
  if (!slugParsed.success) {
    errors.push(
      `Ungültiges Kürzel (slug): ${slugParsed.error.issues.map((issue) => issue.message).join("; ")}`,
    )
  }

  const subsection = await db.subsection.findFirst({
    where: { slug: subsectionSlug, projectId: project.id },
    select: { id: true, slug: true },
  })
  if (!subsection) {
    throw new Error(`Subsection (Planungsabschnitt) not found: ${projectSlug}/${subsectionSlug}`)
  }

  const url = buildNewFormUrl(origin, project.slug, subsection.slug, slug)

  const existingMeasure = await db.subsubsection.findFirst({
    where: { slug, subsectionId: subsection.id },
    select: { slug: true },
  })
  const existingCreateDraft = await db.mcpDraft.findUnique({
    where: { parentSubsectionId_slug: { parentSubsectionId: subsection.id, slug } },
    select: { id: true },
  })

  let slugConflict: SubsubsectionMcpSlugConflict | null = null
  if (existingMeasure) {
    const measureUrl = new URL(
      `/${project.slug}/abschnitte/${subsection.slug}/fuehrung/${existingMeasure.slug}`,
      origin,
    ).href
    slugConflict = { kind: "measure", url: measureUrl }
    errors.push(
      `Kürzel „${slug}“ existiert bereits in diesem Planungsabschnitt. Nutzen Sie subsubsections_update.`,
    )
  } else if (existingCreateDraft) {
    slugConflict = { kind: "createDraft", url }
    warnings.push(`Bestehenden Create-Draft für „${slug}“ überschrieben.`)
  }

  if (patch.type === undefined) missingRequired.push("type")
  if (patch.geometry === undefined) missingRequired.push("geometry")

  if (patch.type !== undefined && patch.geometry !== undefined) {
    const matched = GeometryWithTypeSchema.safeParse({
      type: patch.type,
      geometry: patch.geometry,
    })
    if (!matched.success) {
      errors.push(
        "type und geometry passen nicht zusammen (POINT/Line/POLYGON müssen zum GeoJSON-Typ passen).",
      )
    } else {
      const vertexCount = countGeometryVertices(patch.geometry)
      if (vertexCount > MCP_GEOMETRY_MAX_VERTICES) {
        errors.push(
          `Geometrie zu groß, bitte vereinfachen (max. ${MCP_GEOMETRY_MAX_VERTICES} Stützpunkte)`,
        )
      } else {
        if (vertexCount >= MCP_GEOMETRY_WARN_VERTICES) {
          warnings.push(
            `Geometrie hat ${vertexCount} Stützpunkte. Bitte vorher vereinfachen; große Batches splitten.`,
          )
        }
        pushSet(changes, "type", patch.type)
        pushSet(changes, "geometry", geometryPreview(patch.geometry))
      }
    }
  }

  const definitions = parseDefinitions(project.subsubsectionExtraFieldDefinitions)

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
    pushSet(changes, key, proposedValue)
  }

  const relationSlugs = {
    qualityLevelSlug: patch.qualityLevelSlug,
    subsubsectionStatusSlug: patch.subsubsectionStatusSlug,
    subsubsectionInfraSlug: patch.subsubsectionInfraSlug,
    subsubsectionTaskSlug: patch.subsubsectionTaskSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    try {
      await resolveSubsubsectionRelationSlugs({
        projectId: project.id,
        slugs: relationSlugs,
        missing: "error",
      })
      if (patch.qualityLevelSlug !== undefined) {
        pushSet(changes, "qualityLevelSlug", patch.qualityLevelSlug)
      }
      if (patch.subsubsectionStatusSlug !== undefined) {
        pushSet(changes, "subsubsectionStatusSlug", patch.subsubsectionStatusSlug)
      }
      if (patch.subsubsectionTaskSlug !== undefined) {
        pushSet(changes, "subsubsectionTaskSlug", patch.subsubsectionTaskSlug)
      }
      if (patch.subsubsectionInfraSlug !== undefined) {
        pushSet(changes, "subsubsectionInfraSlug", patch.subsubsectionInfraSlug)
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (patch.subsubsectionInfrastructureTypeSlugs !== undefined) {
    try {
      await resolveSubsubsectionInfrastructureTypeSlugs({
        projectId: project.id,
        slugs: patch.subsubsectionInfrastructureTypeSlugs,
        missing: "error",
      })
      pushSet(
        changes,
        "subsubsectionInfrastructureTypeSlugs",
        patch.subsubsectionInfrastructureTypeSlugs,
      )
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  if (patch.extraFields !== undefined) {
    const allowed = new Set(definitions.map((definition) => definition.name))
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
      pushSet(changes, `extraFields.${key}`, value)
    }
  }

  const okToWrite =
    errors.length === 0 && missingRequired.length === 0 && slugParsed.success && !existingMeasure

  return {
    environment,
    url,
    okToWrite,
    changes,
    errors,
    warnings,
    missingRequired,
    slugConflict,
    subsectionId: subsection.id,
    projectSlug: project.slug,
    subsectionSlug: subsection.slug,
    slug,
    projectId: project.id,
  }
}

export function subsubsectionCreatePreviewPayload(result: ResolveSubsubsectionCreateResult) {
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
    missingRequired: result.missingRequired,
    slugConflict: result.slugConflict,
  }
}
