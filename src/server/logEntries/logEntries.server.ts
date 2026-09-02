import type { z } from "zod"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { paginate } from "@/src/server/utils/paginate.server"
import { GetProjectLogEntriesSchema } from "./logEntries.inputSchemas"

const logEntryInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
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

export async function getProjectLogEntries(
  headers: Headers,
  input: z.infer<typeof GetProjectLogEntriesSchema>,
) {
  const { session } = await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const isAdmin = session.role === UserRoleEnum.ADMIN

  const paginateConfig = {
    skip: 0,
    take: input.take ?? 50,
    count: () => db.logEntry.count({ where: { projectId: input.projectId } }),
  }

  if (isAdmin) {
    const { items: logEntries } = await paginate({
      ...paginateConfig,
      query: (paginateArgs) =>
        db.logEntry.findMany({
          ...paginateArgs,
          where: { projectId: input.projectId },
          orderBy: { id: "desc" },
          select: {
            ...logEntryBaseSelect,
            changes: true,
            user: logEntryInclude.user,
          },
        }),
    })

    return {
      isAdmin: true,
      logEntries: logEntries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        message: entry.message,
        createdAt: entry.createdAt,
        changes: entry.changes,
        user: entry.user,
      })),
    }
  }

  const { items: logEntries } = await paginate({
    ...paginateConfig,
    query: (paginateArgs) =>
      db.logEntry.findMany({
        ...paginateArgs,
        where: { projectId: input.projectId },
        orderBy: { id: "desc" },
        select: logEntryBaseSelect,
      }),
  })

  return {
    isAdmin: false,
    logEntries: logEntries.map((entry) => ({
      id: entry.id,
      action: entry.action,
      message: entry.message,
      createdAt: entry.createdAt,
      changes: null,
      user: null,
    })),
  }
}
