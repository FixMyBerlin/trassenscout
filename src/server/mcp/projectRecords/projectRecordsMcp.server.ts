import { frenchQuote } from "@/src/components/core/components/text/quote"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import {
  McpDraftKind,
  Prisma,
  ProjectRecordEditingState,
  ProjectRecordType,
} from "@/src/prisma/generated/client"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { requireMcpDirectProject } from "@/src/server/mcp/direct/requireMcpDirectProject.server"
import { mcpEnvLabel } from "@/src/server/mcp/mcpCursorConfig"
import { mcpListResult, resolveMcpListLimit } from "@/src/server/mcp/mcpListLimit.const"
import { mcpWriteFields, writeResolvedItem } from "@/src/server/mcp/mcpWriteMode"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { sendProjectRecordAssignmentNotification } from "@/src/server/projectRecords/projectRecords.server"

const editingStates = [
  ProjectRecordEditingState.PENDING,
  ProjectRecordEditingState.COMPLETED,
] as const

const ASSIGNEE_NOT_FOUND = "Zuweisung nicht gefunden"
const TAG_NOT_FOUND = "Tag nicht gefunden"
const TAGS_EMPTY =
  "Leeres Array ist für tags nicht erlaubt. Schlüssel weglassen, um unverändert zu lassen."

type RecordFields = {
  title?: string | null
  editingState?: ProjectRecordEditingState | null
  body?: string | null
  subsectionSlug?: string | null
  subsubsectionSlug?: string | null
  assignedTo?: string | null
  tags?: string[] | null
}

type ResolvedAssignee = { mentioned: false } | { mentioned: true; id: number; submitted: string }

type ResolvedTags = { mentioned: false } | { mentioned: true; ids: number[]; titles: string[] }

function keptString(value: string | null | undefined) {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function recordUrl(origin: string, projectSlug: string, id?: number) {
  const base = `${origin}/${projectSlug}/project-records`
  return id == null ? base : `${base}/${id}/edit`
}

function createDraftUrl(origin: string, projectSlug: string, ref?: string) {
  const params = new URLSearchParams({ mcpDraft: "true" })
  if (ref) params.set("ref", ref)
  return `${origin}/${projectSlug}/project-records?${params.toString()}`
}

function assertEditingState(value: ProjectRecordEditingState | null | undefined) {
  if (value == null || value === ("" as never)) return undefined
  if (!editingStates.includes(value)) throw new Error(`Unbekannter editingState: ${value}`)
  return value
}

async function resolveMeasure(projectId: number, fields: RecordFields) {
  const subsectionSlug = keptString(fields.subsectionSlug)
  const subsubsectionSlug = keptString(fields.subsubsectionSlug)
  const mentioned = "subsectionSlug" in fields || "subsubsectionSlug" in fields
  if (!mentioned) return { mentioned: false as const }
  if (!subsectionSlug && !subsubsectionSlug) return { mentioned: false as const }
  if (!subsectionSlug || !subsubsectionSlug) {
    throw new Error("subsectionSlug und subsubsectionSlug gehören zusammen (genau eine Maßnahme)")
  }
  const row = await db.subsubsection.findFirst({
    where: { slug: subsubsectionSlug, subsection: { slug: subsectionSlug, projectId } },
    select: { id: true, slug: true, subsection: { select: { slug: true } } },
  })
  if (!row) throw new Error(`Maßnahme nicht gefunden: ${subsectionSlug}/${subsubsectionSlug}`)
  return {
    mentioned: true as const,
    id: row.id,
    subsectionSlug: row.subsection.slug,
    subsubsectionSlug: row.slug,
  }
}

export async function listProjectRecordsForMcp(input: {
  projectSlug: string
  origin: string
  limit?: number
}) {
  const limit = resolveMcpListLimit(input.limit)
  const project = await requireMcpEnabledProject(input.projectSlug)
  const rows = await db.projectRecord.findMany({
    where: { projectId: project.id },
    orderBy: { id: "desc" },
    take: limit + 1,
    select: {
      id: true,
      title: true,
      editingState: true,
      subsubsection: { select: { slug: true, subsection: { select: { slug: true } } } },
      subsubsections: { select: { slug: true, subsection: { select: { slug: true } } } },
    },
  })
  const page = mcpListResult(rows, limit)
  return {
    limit: page.limit,
    returned: page.returned,
    truncated: page.truncated,
    items: page.items.map((row) => {
      const links = new Map<string, { subsectionSlug: string; slug: string }>()
      const add = (item: { slug: string; subsection: { slug: string } } | null) => {
        if (!item) return
        links.set(`${item.subsection.slug}\0${item.slug}`, {
          subsectionSlug: item.subsection.slug,
          slug: item.slug,
        })
      }
      add(row.subsubsection)
      for (const item of row.subsubsections) add(item)
      return {
        projectSlug: project.slug,
        id: row.id,
        title: row.title,
        editingState: row.editingState,
        subsubsections: [...links.values()],
        url: recordUrl(input.origin, project.slug, row.id),
      }
    }),
  }
}

function assignmentWrite(
  previousAssigneeId: number | null,
  nextAssigneeId: number,
  actorUserId: number,
) {
  if (previousAssigneeId === nextAssigneeId) return { assignedToId: nextAssigneeId }
  return {
    assignedToId: nextAssigneeId,
    assignedById: actorUserId,
    assignedAt: new Date(),
  }
}

async function resolveAssignedTo(
  projectId: number,
  fields: { assignedTo?: string | null },
): Promise<ResolvedAssignee> {
  if (!("assignedTo" in fields)) return { mentioned: false }
  const trimmed = typeof fields.assignedTo === "string" ? fields.assignedTo.trim() : ""
  if (!trimmed) return { mentioned: false }

  const memberships = await db.membership.findMany({
    where: { projectId },
    select: {
      user: { select: { id: true, firstName: true, lastName: true, institution: true } },
    },
  })
  const matches = /^\d+$/.test(trimmed)
    ? memberships.filter((membership) => membership.user.id === Number(trimmed))
    : memberships.filter((membership) => getFullnameWithInstitution(membership.user) === trimmed)
  const match = matches[0]
  if (matches.length !== 1 || !match) throw new Error(ASSIGNEE_NOT_FOUND)
  return { mentioned: true, id: match.user.id, submitted: trimmed }
}

async function resolveTagTitles(
  projectId: number,
  fields: { tags?: string[] | null },
): Promise<ResolvedTags> {
  if (!("tags" in fields)) return { mentioned: false }
  if (fields.tags == null) return { mentioned: false }
  if (!Array.isArray(fields.tags) || fields.tags.length === 0) throw new Error(TAGS_EMPTY)
  const trimmed = fields.tags.map((title) => title.trim())
  if (trimmed.some((title) => title.length === 0)) throw new Error(TAG_NOT_FOUND)
  const titles = [...new Set(trimmed)]
  const rows = await db.tag.findMany({
    where: { projectId, title: { in: titles }, archivedAt: null },
    select: { id: true, title: true },
  })
  if (rows.length !== titles.length) throw new Error(TAG_NOT_FOUND)
  const idByTitle = new Map(rows.map((row) => [row.title, row.id]))
  const ids = titles.map((title) => {
    const id = idByTitle.get(title)
    if (id == null) throw new Error(TAG_NOT_FOUND)
    return id
  })
  return { mentioned: true, titles, ids }
}

function fieldChanges(patch: {
  title?: string
  editingState?: string
  body?: string
  measure?: string
  assignedTo?: string
  tags?: string
}) {
  return Object.entries(patch)
    .filter((entry): entry is [string, string] => entry[1] != null)
    .map(([field, proposed]) => ({ field, proposed }))
}

export async function createProjectRecordForMcp(input: {
  projectSlug: string
  title: string
  editingState?: ProjectRecordEditingState | null
  body?: string | null
  subsectionSlug?: string | null
  subsubsectionSlug?: string | null
  assignedTo?: string | null
  tags?: string[] | null
  ref?: string | null
  origin: string
  createdById: number
}) {
  try {
    const title = keptString(input.title)
    if (!title) throw new Error("title ist erforderlich")
    const editingState = assertEditingState(input.editingState) ?? ProjectRecordEditingState.PENDING
    const body = keptString(input.body)
    const ref = keptString(input.ref)
    const project = await requireMcpEnabledProject(input.projectSlug)
    const measure = await resolveMeasure(project.id, input)
    const assignee = await resolveAssignedTo(project.id, input)
    const tagSet = await resolveTagTitles(project.id, input)
    const patch = {
      title,
      editingState,
      ...(body ? { body } : {}),
      ...(measure.mentioned
        ? { subsectionSlug: measure.subsectionSlug, subsubsectionSlug: measure.subsubsectionSlug }
        : {}),
      ...(assignee.mentioned ? { assignedToId: assignee.id } : {}),
      ...(tagSet.mentioned ? { tagIds: tagSet.ids } : {}),
    }

    const mode = await writeResolvedItem(project, {
      draft: async () => {
        const data = {
          kind: McpDraftKind.PROJECT_RECORD_CREATE,
          createdById: input.createdById,
          projectId: project.id,
          slug: ref ?? null,
          patch: patch as Prisma.InputJsonValue,
        }
        if (ref) {
          const existing = await db.mcpDraft.findFirst({
            where: { projectId: project.id, kind: McpDraftKind.PROJECT_RECORD_CREATE, slug: ref },
            select: { id: true },
          })
          if (existing) {
            await db.mcpDraft.update({
              where: { id: existing.id },
              data: { createdById: input.createdById, patch: data.patch },
            })
            return
          }
        }
        await db.mcpDraft.create({ data })
      },
      apply: async () => {
        const record = await db.projectRecord.create({
          data: {
            projectId: project.id,
            title,
            editingState,
            body: body ?? null,
            userId: input.createdById,
            projectRecordAuthorType: ProjectRecordType.USER,
            ...(measure.mentioned
              ? {
                  subsubsectionId: measure.id,
                  subsubsections: { connect: [{ id: measure.id }] },
                }
              : {}),
            ...(assignee.mentioned ? assignmentWrite(null, assignee.id, input.createdById) : {}),
            ...(tagSet.mentioned ? { tags: { connect: tagSet.ids.map((id) => ({ id })) } } : {}),
          },
          select: { id: true, title: true, body: true, assignedToId: true },
        })
        if (record.assignedToId != null) {
          await sendProjectRecordAssignmentNotification({
            assigneeId: record.assignedToId,
            actorUserId: input.createdById,
            recordTitle: record.title,
            recordText: record.body,
            projectSlug: project.slug,
            recordId: record.id,
          })
        }
        if (ref) {
          await db.mcpDraft.deleteMany({
            where: { projectId: project.id, kind: McpDraftKind.PROJECT_RECORD_CREATE, slug: ref },
          })
        }
        await createLogEntry({
          action: "CREATE",
          message: `Protokolleintrag ${frenchQuote(record.title)} wurde erstellt.`,
          userId: input.createdById,
          projectSlug: project.slug,
          projectRecordId: record.id,
          updatedRecord: {
            id: record.id,
            title: record.title,
            ...(assignee.mentioned ? { assignedToId: assignee.id } : {}),
            ...(tagSet.mentioned ? { tagIds: tagSet.ids } : {}),
          },
        })
      },
    })

    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: project.slug,
      ref: ref ?? null,
      url:
        mode === "drafted"
          ? createDraftUrl(input.origin, project.slug, ref)
          : recordUrl(input.origin, project.slug),
      ...mcpWriteFields(mode),
      changes: fieldChanges({
        title,
        editingState,
        body,
        measure: measure.mentioned
          ? `${measure.subsectionSlug}/${measure.subsubsectionSlug}`
          : undefined,
        assignedTo: assignee.mentioned ? assignee.submitted : undefined,
        tags: tagSet.mentioned ? tagSet.titles.join(", ") : undefined,
      }),
      errors: [] as string[],
    }
  } catch (error) {
    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: input.projectSlug,
      ref: input.ref ?? null,
      url: null,
      ...mcpWriteFields(null),
      changes: [],
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

export async function updateProjectRecordForMcp(input: {
  projectSlug: string
  id: number
  patch: RecordFields
  origin: string
  createdById: number
}) {
  try {
    const title = keptString(input.patch.title)
    const editingState = assertEditingState(input.patch.editingState)
    const body = keptString(input.patch.body)
    const project = await requireMcpEnabledProject(input.projectSlug)
    const row = await db.projectRecord.findFirst({
      where: { id: input.id, projectId: project.id },
      select: { id: true, title: true, body: true, assignedToId: true },
    })
    if (!row) throw new Error(`Protokolleintrag nicht gefunden: ${input.id}`)
    const measure = await resolveMeasure(project.id, input.patch)
    const assignee = await resolveAssignedTo(project.id, input.patch)
    const tagSet = await resolveTagTitles(project.id, input.patch)
    const patch = {
      ...(title ? { title } : {}),
      ...(editingState ? { editingState } : {}),
      ...(body ? { body } : {}),
      ...(measure.mentioned
        ? { subsectionSlug: measure.subsectionSlug, subsubsectionSlug: measure.subsubsectionSlug }
        : {}),
      ...(assignee.mentioned ? { assignedToId: assignee.id } : {}),
      ...(tagSet.mentioned ? { tagIds: tagSet.ids } : {}),
    }
    if (Object.keys(patch).length === 0) throw new Error("patch ändert nichts")

    const mode = await writeResolvedItem(project, {
      draft: async () => {
        await db.mcpDraft.upsert({
          where: { projectRecordId: row.id },
          create: {
            kind: McpDraftKind.PROJECT_RECORD_UPDATE,
            createdById: input.createdById,
            projectId: project.id,
            projectRecordId: row.id,
            patch: patch as Prisma.InputJsonValue,
          },
          update: { createdById: input.createdById, patch: patch as Prisma.InputJsonValue },
        })
      },
      apply: async () => {
        await db.projectRecord.update({
          where: { id: row.id },
          data: {
            ...(title ? { title } : {}),
            ...(editingState ? { editingState } : {}),
            ...(body ? { body } : {}),
            ...(measure.mentioned
              ? { subsubsectionId: measure.id, subsubsections: { set: [{ id: measure.id }] } }
              : {}),
            ...(assignee.mentioned
              ? assignmentWrite(row.assignedToId ?? null, assignee.id, input.createdById)
              : {}),
            ...(tagSet.mentioned ? { tags: { set: tagSet.ids.map((id) => ({ id })) } } : {}),
          },
        })
        if (assignee.mentioned && assignee.id !== (row.assignedToId ?? null)) {
          await sendProjectRecordAssignmentNotification({
            assigneeId: assignee.id,
            actorUserId: input.createdById,
            recordTitle: title ?? row.title,
            recordText: body ?? row.body,
            projectSlug: project.slug,
            recordId: row.id,
          })
        }
        await db.mcpDraft.deleteMany({ where: { projectRecordId: row.id } })
        await createLogEntry({
          action: "UPDATE",
          message: `Protokolleintrag ${frenchQuote(title ?? row.title)} wurde bearbeitet.`,
          userId: input.createdById,
          projectSlug: project.slug,
          projectRecordId: row.id,
          previousRecord: { id: row.id, title: row.title },
          updatedRecord: { id: row.id, ...patch },
        })
      },
    })

    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: project.slug,
      id: row.id,
      url: recordUrl(input.origin, project.slug, row.id),
      ...mcpWriteFields(mode),
      changes: fieldChanges({
        title,
        editingState,
        body,
        measure: measure.mentioned
          ? `${measure.subsectionSlug}/${measure.subsubsectionSlug}`
          : undefined,
        assignedTo: assignee.mentioned ? assignee.submitted : undefined,
        tags: tagSet.mentioned ? tagSet.titles.join(", ") : undefined,
      }),
      errors: [] as string[],
    }
  } catch (error) {
    return {
      environment: mcpEnvLabel(process.env.VITE_APP_ENV),
      projectSlug: input.projectSlug,
      id: input.id,
      url: null,
      ...mcpWriteFields(null),
      changes: [],
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

export async function deleteProjectRecordForMcp(input: {
  items: { projectSlug: string; id: number }[]
  confirm?: boolean
  origin: string
  createdById: number
}) {
  const seen = new Map<string, { projectSlug: string; id: number }>()
  for (const item of input.items) {
    const key = `${item.projectSlug}\0${item.id}`
    seen.delete(key)
    seen.set(key, item)
  }
  const results = []
  let deletedCount = 0
  for (const item of seen.values()) {
    try {
      const project = await requireMcpDirectProject(item.projectSlug)
      const row = await db.projectRecord.findFirst({
        where: { id: item.id, projectId: project.id },
        select: {
          id: true,
          title: true,
          _count: { select: { projectRecordComments: true, uploads: true } },
        },
      })
      if (!row) throw new Error(`Protokolleintrag nicht gefunden: ${item.id}`)
      const counts = {
        commentCount: row._count.projectRecordComments,
        uploadCount: row._count.uploads,
      }
      const url = recordUrl(input.origin, project.slug, row.id)
      if (!input.confirm) {
        results.push({ ...item, url, ...counts, deleted: false, errors: [] as string[] })
        continue
      }
      if (counts.commentCount + counts.uploadCount > 0) {
        results.push({
          ...item,
          url,
          ...counts,
          deleted: false,
          errors: [
            "Protokolleintrag kann nicht gelöscht werden, solange Kommentare oder Dateien hängen.",
          ],
        })
        continue
      }
      await db.projectRecord.delete({ where: { id: row.id } })
      await createLogEntry({
        action: "DELETE",
        message: `Protokolleintrag ${frenchQuote(row.title)} wurde gelöscht.`,
        userId: input.createdById,
        projectSlug: project.slug,
        previousRecord: { id: row.id, title: row.title },
      })
      deletedCount += 1
      results.push({ ...item, url, ...counts, deleted: true, errors: [] as string[] })
    } catch (error) {
      results.push({
        ...item,
        url: null,
        commentCount: 0,
        uploadCount: 0,
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
