import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { McpDraftKind } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { subsectionMcpFieldLabel } from "@/src/server/mcp/subsectionUpdate/patchFieldLabel"
import type { SubsectionMcpCreatePatch } from "@/src/server/mcp/subsectionUpdate/patchSchema"
import { buildSubsectionNewUrl } from "@/src/server/mcp/subsectionUrl"
import type { SubsubsectionPreviewChange } from "@/src/server/mcp/subsubsectionUpdate/formatPreview"
import {
  countGeometryVertices,
  geometryPreview,
  MCP_GEOMETRY_MAX_VERTICES,
  MCP_GEOMETRY_WARN_VERTICES,
} from "@/src/server/mcp/subsubsectionUpdate/geometryPreview"
import { resolveSubsectionRelationSlugs } from "@/src/server/subsections/resolveSubsectionRelationSlugs.server"
import { SubsectionGeometryWithTypeSchema } from "@/src/shared/geometry/geometrySchemas"

const SCALAR_KEYS = [
  "description",
  "lengthM",
  "estimatedCompletionDateString",
] as const satisfies readonly (keyof SubsectionMcpCreatePatch)[]

function fieldLabel(field: string) {
  return subsectionMcpFieldLabel(field)
}

function pushSet(changes: SubsubsectionPreviewChange[], field: string, proposed: unknown) {
  changes.push({ field, label: fieldLabel(field), kind: "set", proposed })
}

type SubsectionMcpSlugConflict = {
  kind: "subsection" | "createDraft"
  url: string
}

export type ResolveSubsectionCreateResult = {
  environment: ReturnType<typeof mcpEnvLabel>
  url: string
  okToWrite: boolean
  changes: SubsubsectionPreviewChange[]
  errors: string[]
  warnings: string[]
  missingRequired: string[]
  slugConflict: SubsectionMcpSlugConflict | null
  projectSlug: string
  slug: string
  projectId: number
}

export async function resolveSubsectionCreate({
  projectSlug,
  slug,
  patch,
  origin,
}: {
  projectSlug: string
  slug: string
  patch: SubsectionMcpCreatePatch
  origin: string
}): Promise<ResolveSubsectionCreateResult> {
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

  const url = buildSubsectionNewUrl(origin, project.slug, slug)

  const existingSubsection = await db.subsection.findFirst({
    where: { slug, projectId: project.id },
    select: { slug: true },
  })
  const existingCreateDraft = await db.mcpDraft.findFirst({
    where: { kind: McpDraftKind.SUBSECTION_CREATE, projectId: project.id, slug },
    select: { id: true },
  })

  let slugConflict: SubsectionMcpSlugConflict | null = null
  if (existingSubsection) {
    const subsectionUrl = new URL(`/${project.slug}/abschnitte/${existingSubsection.slug}`, origin)
      .href
    slugConflict = { kind: "subsection", url: subsectionUrl }
    errors.push(
      `Kürzel „${slug}“ existiert bereits in diesem Projekt. Nutzen Sie subsections_update.`,
    )
  } else if (existingCreateDraft) {
    slugConflict = { kind: "createDraft", url }
    warnings.push(`Bestehenden Create-Draft für „${slug}“ überschrieben.`)
  }

  if (patch.type === undefined) missingRequired.push("type")
  if (patch.geometry === undefined) missingRequired.push("geometry")

  if (patch.type !== undefined && patch.geometry !== undefined) {
    const matched = SubsectionGeometryWithTypeSchema.safeParse({
      type: patch.type,
      geometry: patch.geometry,
    })
    if (!matched.success) {
      errors.push(
        "type und geometry passen nicht zusammen (LINE/POLYGON müssen zum GeoJSON-Typ passen; POINT ist für Planungsabschnitte nicht erlaubt).",
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

  for (const key of SCALAR_KEYS) {
    if (!(key in patch) || patch[key] === undefined) continue
    const proposed = patch[key]
    if (proposed === null) {
      errors.push(
        `${fieldLabel(key)} (${key}): MCP cannot clear fields with null. Omit the key to leave the value unchanged.`,
      )
      continue
    }
    pushSet(changes, key, proposed)
  }

  const relationSlugs = {
    operatorSlug: patch.operatorSlug,
    networkHierarchySlug: patch.networkHierarchySlug,
    subsectionStatusSlug: patch.subsectionStatusSlug,
  }
  if (Object.values(relationSlugs).some((value) => value !== undefined)) {
    try {
      await resolveSubsectionRelationSlugs({
        projectId: project.id,
        slugs: relationSlugs,
        missing: "error",
      })
      if (patch.operatorSlug !== undefined) {
        pushSet(changes, "operatorSlug", patch.operatorSlug)
      }
      if (patch.networkHierarchySlug !== undefined) {
        pushSet(changes, "networkHierarchySlug", patch.networkHierarchySlug)
      }
      if (patch.subsectionStatusSlug !== undefined) {
        pushSet(changes, "subsectionStatusSlug", patch.subsectionStatusSlug)
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  const okToWrite =
    errors.length === 0 && missingRequired.length === 0 && slugParsed.success && !existingSubsection

  return {
    environment,
    url,
    okToWrite,
    changes,
    errors,
    warnings,
    missingRequired,
    slugConflict,
    projectSlug: project.slug,
    slug,
    projectId: project.id,
  }
}

export function subsectionCreatePreviewPayload(result: ResolveSubsectionCreateResult) {
  return {
    environment: result.environment,
    url: result.url,
    projectSlug: result.projectSlug,
    slug: result.slug,
    okToWrite: result.okToWrite,
    changes: result.changes,
    errors: result.errors,
    warnings: result.warnings,
    missingRequired: result.missingRequired,
    slugConflict: result.slugConflict,
  }
}
