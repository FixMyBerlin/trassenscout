import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { paginate } from "@/src/server/utils/paginate.server"
import { pageToSkipTake } from "@/src/shared/pagination/pageToSkipTake"
import { GetSystemLogEntriesSchema } from "@/src/shared/systemLogEntries/searchSchemas"

export async function getSystemLogEntries(
  headers: Headers,
  input: z.infer<typeof GetSystemLogEntriesSchema>,
) {
  await endpointAuth.admin(headers)

  const { skip, take, page, pageSize } = pageToSkipTake(input.page, input.pageSize)

  const {
    items: logEntries,
    hasMore,
    nextPage,
    count,
    pageCount,
    from,
    to,
  } = await paginate({
    skip,
    take,
    count: () => db.systemLogEntry.count(),
    query: (paginateArgs) =>
      db.systemLogEntry.findMany({
        ...paginateArgs,
        orderBy: { id: "desc" },
      }),
  })

  return {
    logEntries,
    nextPage,
    hasMore,
    count,
    pageCount,
    page,
    pageSize,
    from,
    to,
  }
}
