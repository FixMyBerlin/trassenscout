import type { z } from "zod"
import { LogLevelActionEnum, UserRoleEnum, type Prisma } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { toCursorPage } from "@/src/server/utils/cursorPage.server"
import { GetLogEntriesSchema, type LogEntriesCursorSchema } from "./logEntries.inputSchemas"

const logEntryInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      institution: true,
      lastName: true,
    },
  },
} as const

const logEntryBaseSelect = {
  id: true,
  action: true,
  message: true,
  createdAt: true,
} as const

const LOG_ENTRIES_PAGE_SIZE = 100
const LOG_ENTRIES_EXPORT_MAX = 50_000

type LogEntriesCursor = z.infer<typeof LogEntriesCursorSchema>

type LogEntriesFilter = {
  isAdmin: boolean
  userId: number
  projectSlug: string | undefined
  months: number | undefined
}

function visibleProjectWhere(options: {
  isAdmin: boolean
  userId: number
  projectSlug: string | undefined
}) {
  const slugFilter = options.projectSlug ? { slug: options.projectSlug } : {}

  if (options.isAdmin) return { project: { is: slugFilter } }

  return {
    project: {
      is: {
        ...slugFilter,
        showLogEntries: true,
        memberships: { some: { userId: options.userId, role: { in: editorRoles } } },
      },
    },
  }
}

function createdAfter(months: number | undefined) {
  if (!months) return {}

  const from = new Date()
  from.setMonth(from.getMonth() - months)
  return { createdAt: { gte: from } }
}

function logEntriesWhere(options: LogEntriesFilter) {
  return { ...visibleProjectWhere(options), ...createdAfter(options.months) }
}

function olderThanCursor(cursor: LogEntriesCursor) {
  const createdAt = new Date(cursor.createdAt)
  return {
    OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: cursor.id } }],
  }
}

function logEntrySelect(isAdmin: boolean) {
  return {
    ...logEntryBaseSelect,
    project: { select: { slug: true } },
    ...(isAdmin ? { changes: true, user: logEntryInclude.user } : {}),
  }
}

function toLogEntryRow(entry: {
  id: number
  action: LogLevelActionEnum
  message: string | null
  createdAt: Date
  project: { slug: string } | null
  changes?: Prisma.JsonValue
  user?: {
    id: number
    firstName: string
    lastName: string
    institution: string | null
  } | null
}) {
  return {
    id: entry.id,
    action: entry.action,
    message: entry.message,
    createdAt: entry.createdAt,
    projectSlug: entry.project?.slug ?? null,
    changes: "changes" in entry ? (entry.changes ?? null) : null,
    user: "user" in entry ? (entry.user ?? null) : null,
  }
}

export async function getLogEntries(headers: Headers, input: z.infer<typeof GetLogEntriesSchema>) {
  const session = await endpointAuth.session(headers)
  const isAdmin = session.role === UserRoleEnum.ADMIN
  const filter: LogEntriesFilter = {
    isAdmin,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
    months: input.months,
  }
  const where = input.cursor
    ? { AND: [logEntriesWhere(filter), olderThanCursor(input.cursor)] }
    : logEntriesWhere(filter)

  const rows = await db.logEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LOG_ENTRIES_PAGE_SIZE + 1,
    select: logEntrySelect(isAdmin),
  })

  const page = toCursorPage(rows, LOG_ENTRIES_PAGE_SIZE, (entry) => ({
    createdAt: entry.createdAt.toISOString(),
    id: entry.id,
  }))

  return {
    isAdmin,
    logEntries: page.items.map(toLogEntryRow),
    nextCursor: page.nextCursor,
  }
}

export async function getLogEntriesForExport(
  headers: Headers,
  input: { projectSlug?: string; months?: number },
) {
  const session = await endpointAuth.session(headers)
  const isAdmin = session.role === UserRoleEnum.ADMIN

  const rows = await db.logEntry.findMany({
    where: logEntriesWhere({
      isAdmin,
      userId: Number(session.userId),
      projectSlug: input.projectSlug,
      months: input.months,
    }),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: LOG_ENTRIES_EXPORT_MAX,
    select: logEntrySelect(isAdmin),
  })

  return {
    isAdmin,
    logEntries: rows.map(toLogEntryRow),
  }
}

export async function getGeneralLogEntries(headers: Headers) {
  await endpointAuth.admin(headers)

  const logEntries = await db.logEntry.findMany({
    where: { projectId: null },
    orderBy: { id: "desc" },
    take: 50,
    include: logEntryInclude,
  })

  return { logEntries }
}
