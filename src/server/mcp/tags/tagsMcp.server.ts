import { Prisma, type TagColorEnum } from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { lastWinsItems } from "@/src/server/mcp/lastWinsItems"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { mcpWriteFields } from "@/src/server/mcp/mcpWriteMode"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

type TagCreateItem = {
  projectSlug: string
  title: string
  color?: TagColorEnum
  description?: string
}

type TagUpdateItem = {
  projectSlug: string
  title: string
  patch: {
    title?: string
    color?: TagColorEnum
    description?: string
    clear?: "description"[]
  }
}

type TagChange = { field: string; proposed: string | null }

const tagsUrl = (origin: string, projectSlug: string) => `${origin}/${projectSlug}/tags`

const sameTitleWhere = (projectId: number, title: string) => ({
  projectId,
  title: { equals: title, mode: "insensitive" as const },
})

function tagWriteError(error: unknown, title: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return `Tag existiert bereits: ${title}`
  }
  return error instanceof Error ? error.message : String(error)
}

export async function listTagsForMcp(input: {
  projectSlug: string
  origin: string
  limit?: number
}) {
  const limit = resolveMcpListLimit(input.limit)
  const project = await requireMcpEnabledProject(input.projectSlug)
  const rows = await db.tag.findMany({
    where: { projectId: project.id },
    orderBy: { title: "asc" },
    take: limit + 1,
    select: { title: true, color: true, description: true, archivedAt: true },
  })
  const page = mcpListResult(rows, limit)
  return {
    limit: page.limit,
    returned: page.returned,
    truncated: page.truncated,
    items: page.items.map((tag) => ({
      projectSlug: project.slug,
      title: tag.title,
      color: tag.color,
      description: tag.description,
      archived: tag.archivedAt !== null,
      url: tagsUrl(input.origin, project.slug),
    })),
  }
}

// Same rule as creating a tag in the app: a title in any case is the same tag.
async function writeTag(projectId: number, item: TagCreateItem, title: string) {
  const existing = await db.tag.findFirst({
    where: sameTitleWhere(projectId, title),
    select: { id: true, title: true, archivedAt: true },
  })
  if (existing?.archivedAt) {
    await db.tag.update({ where: { id: existing.id }, data: { archivedAt: null } })
    return {
      outcome: "restored" as const,
      title: existing.title,
      changes: [{ field: "archived", proposed: "false" }],
    }
  }
  if (existing) return { outcome: "unchanged" as const, title: existing.title, changes: [] }

  const description = item.description?.trim() || undefined
  await db.tag.create({
    data: {
      projectId,
      title,
      ...(item.color ? { color: item.color } : {}),
      ...(description ? { description } : {}),
    },
  })
  return {
    outcome: "created" as const,
    title,
    changes: [
      { field: "title", proposed: title },
      ...(item.color ? [{ field: "color", proposed: item.color }] : []),
      ...(description ? [{ field: "description", proposed: description }] : []),
    ],
  }
}

export async function createTagsForMcp(input: { items: TagCreateItem[]; origin: string }) {
  const items = lastWinsItems(input.items, (item) => [
    item.projectSlug,
    item.title.trim().toLocaleLowerCase("de"),
  ])

  const results = []
  for (const item of items) {
    const title = item.title.trim()
    try {
      if (!title) throw new Error("title ist erforderlich")
      const project = await requireMcpDirectProject(item.projectSlug, new Date(), "Tag writes")
      const written = await writeTag(project.id, item, title)
      results.push({
        projectSlug: project.slug,
        title: written.title,
        outcome: written.outcome,
        url: tagsUrl(input.origin, project.slug),
        ...mcpWriteFields(written.outcome === "unchanged" ? null : "applied"),
        changes: written.changes,
        errors: [] as string[],
      })
    } catch (error) {
      results.push({
        projectSlug: item.projectSlug,
        title,
        outcome: null,
        url: null,
        ...mcpWriteFields(null),
        changes: [],
        errors: [tagWriteError(error, title)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    items: results,
  }
}

function tagPatchData(
  tag: { title: string; color: TagColorEnum; description: string | null },
  patch: TagUpdateItem["patch"],
) {
  const title = patch.title?.trim()
  const description = patch.description?.trim()
  const clearsDescription = patch.clear?.includes("description") ?? false
  if (title === "") throw new Error("title darf nicht leer sein")
  if (description === "") throw new Error("description: zum Leeren clear verwenden")
  if (description && clearsDescription) {
    throw new Error("description: send it either in the patch or in clear, not both.")
  }
  if (!title && !patch.color && !description && !clearsDescription) {
    throw new Error("patch ist leer: title, color, description oder clear angeben")
  }

  const data: { title?: string; color?: TagColorEnum; description?: string | null } = {}
  if (title && title !== tag.title) data.title = title
  if (patch.color && patch.color !== tag.color) data.color = patch.color
  if (description && description !== tag.description) data.description = description
  if (clearsDescription && tag.description !== null) data.description = null

  const changes: TagChange[] = Object.entries(data).map(([field, proposed]) => ({
    field,
    proposed,
  }))
  return { data, changes }
}

export async function updateTagsForMcp(input: { items: TagUpdateItem[]; origin: string }) {
  const items = lastWinsItems(input.items, (item) => [
    item.projectSlug,
    item.title.trim().toLocaleLowerCase("de"),
  ])

  const results = []
  for (const item of items) {
    const title = item.title.trim()
    try {
      const project = await requireMcpDirectProject(item.projectSlug, new Date(), "Tag writes")
      const tag = await db.tag.findFirst({
        where: sameTitleWhere(project.id, title),
        select: { id: true, title: true, color: true, description: true },
      })
      if (!tag) throw new Error(`Tag nicht gefunden: ${title}`)

      const { data, changes } = tagPatchData(tag, item.patch)
      if (data.title) {
        const duplicate = await db.tag.findFirst({
          where: { ...sameTitleWhere(project.id, data.title), id: { not: tag.id } },
          select: { id: true },
        })
        if (duplicate) throw new Error(`Tag existiert bereits: ${data.title}`)
      }
      if (changes.length > 0) await db.tag.update({ where: { id: tag.id }, data })

      results.push({
        projectSlug: project.slug,
        title: data.title ?? tag.title,
        outcome: changes.length > 0 ? ("updated" as const) : ("unchanged" as const),
        url: tagsUrl(input.origin, project.slug),
        ...mcpWriteFields(changes.length > 0 ? "applied" : null),
        changes,
        errors: [] as string[],
      })
    } catch (error) {
      results.push({
        projectSlug: item.projectSlug,
        title,
        outcome: null,
        url: null,
        ...mcpWriteFields(null),
        changes: [],
        errors: [tagWriteError(error, item.patch.title?.trim() ?? title)],
      })
    }
  }

  return {
    environment: mcpEnvLabel(process.env.VITE_APP_ENV),
    returned: results.length,
    items: results,
  }
}
