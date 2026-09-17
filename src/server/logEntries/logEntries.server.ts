import type { z } from "zod"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { GetLogEntriesSchema } from "./logEntries.inputSchemas"

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

const LOG_ENTRIES_DEFAULT_TAKE = 100

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

export async function getLogEntries(headers: Headers, input: z.infer<typeof GetLogEntriesSchema>) {
  const session = await endpointAuth.session(headers)
  const isAdmin = session.role === UserRoleEnum.ADMIN
  const projectWhere = visibleProjectWhere({
    isAdmin,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
  })

  const logEntries = await db.logEntry.findMany({
    where: { ...projectWhere, ...createdAfter(input.months) },
    // Across projects the reading order is time, not project.
    orderBy: { createdAt: "desc" },
    take: input.take ?? LOG_ENTRIES_DEFAULT_TAKE,
    select: {
      ...logEntryBaseSelect,
      project: { select: { slug: true } },
      ...(isAdmin ? { changes: true, user: logEntryInclude.user } : {}),
    },
  })

  return {
    isAdmin,
    logEntries: logEntries.map((entry) => ({
      id: entry.id,
      action: entry.action,
      message: entry.message,
      createdAt: entry.createdAt,
      projectSlug: entry.project?.slug ?? null,
      changes: "changes" in entry ? entry.changes : null,
      user: "user" in entry ? entry.user : null,
    })),
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
