import type { z } from "zod"
import { lookupTableConfig } from "@/src/server/adminLookupTables/lookupTableConfig"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { paginate } from "@/src/server/utils/paginate.server"
import type { GetOperatorsPaginatedSchema } from "@/src/shared/operators/searchSchemas"
import { pageToSkipTake } from "@/src/shared/pagination/pageToSkipTake"

export async function getOperatorsPaginated(
  headers: Headers,
  input: z.infer<typeof GetOperatorsPaginatedSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)

  const { skip, take, page, pageSize } = pageToSkipTake(input.page, input.pageSize)
  const where = { project: { slug: input.projectSlug } }
  const config = lookupTableConfig.operators

  const {
    items: operators,
    hasMore,
    count,
    from,
    to,
  } = await paginate({
    skip,
    take,
    count: () => db.operator.count({ where }),
    query: (paginateArgs) =>
      db.operator.findMany({
        ...paginateArgs,
        where,
        orderBy: { order: "asc" },
      }),
  })

  const rowsWithCount = await Promise.all(
    operators.map(async (row) => ({
      ...row,
      [config.countField]: await config.countForRow(input.projectSlug, row.id),
    })),
  )

  return {
    operators: rowsWithCount,
    rows: rowsWithCount,
    hasMore,
    count,
    from,
    to,
    page,
    pageSize,
  }
}
