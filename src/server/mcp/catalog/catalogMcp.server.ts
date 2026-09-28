import { SlugSchema } from "@/src/components/core/utils/schema-shared"
import { Prisma, SubsubsectionStatusStyleEnum } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { type CatalogConfig, statusStyles } from "@/src/server/mcp/catalog/catalogMcp.config"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { mcpWriteFields } from "@/src/server/mcp/mcpWriteMode"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

type CatalogPatch = {
  title?: string | null
  style?: SubsubsectionStatusStyleEnum | null
}

type CatalogCreateItem = {
  projectSlug: string
  slug: string
  title: string
  style?: SubsubsectionStatusStyleEnum | null
}

type CatalogUpdateInput = {
  projectSlug: string
  slug: string
  patch: CatalogPatch
}

type CatalogDeleteItem = {
  projectSlug: string
  slug: string
}

function keptString(value: string | null | undefined) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function catalogUrl(origin: string, projectSlug: string, config: CatalogConfig, id?: number) {
  const base = `${origin}/${projectSlug}/${config.routeSegment}`
  return id == null ? base : `${base}/${id}/edit`
}

function catalogWriteError(error: unknown, config: CatalogConfig, slug: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return `${config.label} existiert bereits: ${slug}`
  }
  return error instanceof Error ? error.message : String(error)
}

function assertSlug(slug: string) {
  const parsed = SlugSchema.safeParse(slug)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Ungültiges Kürzel")
  return parsed.data
}

function assertStyle(
  config: CatalogConfig,
  style: SubsubsectionStatusStyleEnum | null | undefined,
) {
  if (style == null || style === ("" as never)) return undefined
  if (!config.hasStyle) throw new Error(`${config.label} hat kein style`)
  if (!statusStyles.includes(style)) throw new Error(`Unbekanntes style: ${style}`)
  return style
}

function patchChanges(patch: { title?: string; style?: SubsubsectionStatusStyleEnum }) {
  const changes: { field: string; proposed: string }[] = []
  if (patch.title != null) changes.push({ field: "title", proposed: patch.title })
  if (patch.style != null) changes.push({ field: "style", proposed: patch.style })
  return changes
}

async function referenceCounts(config: CatalogConfig, projectId: number, rowId: number) {
  if (config.model === "operator") {
    const [subsectionCount, surveyResponseCount] = await Promise.all([
      db.subsection.count({ where: { projectId, operatorId: rowId } }),
      db.surveyResponse.count({
        where: { operatorId: rowId, surveySession: { survey: { projectId } } },
      }),
    ])
    return { subsectionCount, surveyResponseCount, subsubsectionCount: 0 }
  }
  const fk =
    config.model === "subsubsectionInfra"
      ? { subsubsectionInfraId: rowId }
      : config.model === "subsubsectionStatus"
        ? { subsubsectionStatusId: rowId }
        : { subsubsectionTaskId: rowId }
  const subsubsectionCount = await db.subsubsection.count({
    where: { ...fk, subsection: { projectId } },
  })
  return { subsectionCount: 0, surveyResponseCount: 0, subsubsectionCount }
}

function delegate(config: CatalogConfig) {
  return db[config.model] as unknown as {
    findMany: (
      args: unknown,
    ) => Promise<{ id: number; slug: string; title: string; style?: string }[]>
    findFirst: (args: unknown) => Promise<{
      id: number
      slug: string
      title: string
      style?: SubsubsectionStatusStyleEnum
    } | null>
    create: (args: unknown) => Promise<{ id: number; slug: string; title: string }>
    update: (args: unknown) => Promise<{ id: number; slug: string; title: string }>
    delete: (args: unknown) => Promise<unknown>
  }
}

export async function listCatalogForMcp(
  config: CatalogConfig,
  input: { projectSlug: string; origin: string; limit?: number },
) {
  const limit = resolveMcpListLimit(input.limit)
  const project = await requireMcpEnabledProject(input.projectSlug)
  const rows = await delegate(config).findMany({
    where: { projectId: project.id },
    orderBy: { slug: "asc" },
    take: limit + 1,
    select: { id: true, slug: true, title: true, ...(config.hasStyle ? { style: true } : {}) },
  })
  const page = mcpListResult(rows, limit)
  return {
    limit: page.limit,
    returned: page.returned,
    truncated: page.truncated,
    items: page.items.map((row) => ({
      projectSlug: project.slug,
      slug: row.slug,
      title: row.title,
      ...(config.hasStyle ? { style: row.style } : {}),
      url: catalogUrl(input.origin, project.slug, config, row.id),
    })),
  }
}

export async function createCatalogForMcp(
  config: CatalogConfig,
  input: { items: CatalogCreateItem[]; origin: string; createdById: number },
) {
  const seen = new Map<string, CatalogCreateItem>()
  for (const item of input.items) {
    const key = `${item.projectSlug}\0${item.slug}`
    seen.delete(key)
    seen.set(key, item)
  }

  const results = []
  for (const item of seen.values()) {
    try {
      const slug = assertSlug(item.slug)
      const title = keptString(item.title)
      if (!title) throw new Error("title ist erforderlich")
      const style = assertStyle(config, item.style)
      const project = await requireMcpDirectProject(item.projectSlug, new Date(), "Catalog writes")
      const existing = await delegate(config).findFirst({
        where: { projectId: project.id, slug },
        select: { id: true },
      })
      if (existing) throw new Error(`${config.label} existiert bereits: ${slug}`)

      const patch = { title, ...(style ? { style } : {}) }
      await delegate(config).create({
        data: { projectId: project.id, slug, title, ...(style ? { style } : {}) },
      })
      results.push({
        projectSlug: project.slug,
        slug,
        url: catalogUrl(input.origin, project.slug, config),
        ...mcpWriteFields("applied"),
        changes: patchChanges(patch),
        errors: [] as string[],
      })
    } catch (error) {
      results.push({
        projectSlug: item.projectSlug,
        slug: item.slug,
        url: null,
        ...mcpWriteFields(null),
        changes: [],
        errors: [catalogWriteError(error, config, item.slug)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    items: results,
  }
}

export async function updateCatalogForMcp(
  config: CatalogConfig,
  input: CatalogUpdateInput & { origin: string; createdById: number },
) {
  try {
    const slug = assertSlug(input.slug)
    const title = keptString(input.patch.title)
    const style = assertStyle(config, input.patch.style)
    const patch = { ...(title ? { title } : {}), ...(style ? { style } : {}) }
    if (Object.keys(patch).length === 0) throw new Error("patch ändert nichts")

    const project = await requireMcpDirectProject(input.projectSlug, new Date(), "Catalog writes")
    const row = await delegate(config).findFirst({
      where: { projectId: project.id, slug },
      select: { id: true, slug: true, title: true },
    })
    if (!row) throw new Error(`${config.label} nicht gefunden: ${slug}`)

    await delegate(config).update({ where: { id: row.id }, data: patch })

    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: project.slug,
      slug,
      url: catalogUrl(input.origin, project.slug, config, row.id),
      ...mcpWriteFields("applied"),
      changes: patchChanges(patch),
      errors: [] as string[],
    }
  } catch (error) {
    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: input.projectSlug,
      slug: input.slug,
      url: null,
      ...mcpWriteFields(null),
      changes: [],
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

export async function deleteCatalogForMcp(
  config: CatalogConfig,
  input: { items: CatalogDeleteItem[]; confirm?: boolean; origin: string; createdById: number },
) {
  const seen = new Map<string, CatalogDeleteItem>()
  for (const item of input.items) {
    const key = `${item.projectSlug}\0${item.slug}`
    seen.delete(key)
    seen.set(key, item)
  }

  const results = []
  let deletedCount = 0
  for (const item of seen.values()) {
    try {
      const project = await requireMcpDirectProject(item.projectSlug)
      const row = await delegate(config).findFirst({
        where: { projectId: project.id, slug: item.slug },
        select: { id: true, slug: true, title: true },
      })
      if (!row) throw new Error(`${config.label} nicht gefunden: ${item.slug}`)
      const counts = await referenceCounts(config, project.id, row.id)
      const url = catalogUrl(input.origin, project.slug, config, row.id)
      const blocked =
        counts.subsectionCount + counts.surveyResponseCount + counts.subsubsectionCount > 0

      if (!input.confirm) {
        results.push({ ...item, url, ...counts, deleted: false, errors: [] as string[] })
        continue
      }
      if (blocked) {
        results.push({
          ...item,
          url,
          ...counts,
          deleted: false,
          errors: [
            `${config.label} kann nicht gelöscht werden, solange noch Einträge darauf verweisen.`,
          ],
        })
        continue
      }
      await delegate(config).delete({ where: { id: row.id } })
      deletedCount += 1
      results.push({ ...item, url, ...counts, deleted: true, errors: [] as string[] })
    } catch (error) {
      results.push({
        ...item,
        url: null,
        subsectionCount: 0,
        surveyResponseCount: 0,
        subsubsectionCount: 0,
        deleted: false,
        errors: [error instanceof Error ? error.message : String(error)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    confirm: input.confirm === true,
    returned: results.length,
    deletedCount,
    items: results,
  }
}
