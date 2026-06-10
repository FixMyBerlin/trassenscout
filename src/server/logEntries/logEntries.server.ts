import type { z } from "zod"
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
  await endpointAuth.projectRole(headers, input.projectSlug, editorRoles)
  const { items: logEntries } = await paginate({
    skip: 0,
    take: input.take ?? 50,
    count: () => db.logEntry.count({ where: { projectId: input.projectId } }),
    query: (paginateArgs) =>
      db.logEntry.findMany({
        ...paginateArgs,
        where: { projectId: input.projectId },
        orderBy: { id: "desc" },
        include: logEntryInclude,
      }),
  })

  return { logEntries }
}
