import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import {
  getSubsubsectionMcpDraftFn,
  listMcpDraftsGroupedFn,
  listSubsectionMcpCreateDraftsFn,
} from "./mcpDrafts.functions"
import type {
  GetSubsubsectionMcpDraftSchema,
  ListSubsectionMcpCreateDraftsSchema,
} from "./mcpDrafts.inputSchemas"

export function subsubsectionMcpDraftQueryOptions(
  input: z.infer<typeof GetSubsubsectionMcpDraftSchema>,
) {
  return queryOptions({
    queryKey: ["subsubsectionMcpDraft", input],
    queryFn: () => getSubsubsectionMcpDraftFn({ data: input }),
  })
}

export function subsectionMcpCreateDraftsQueryOptions(
  input: z.infer<typeof ListSubsectionMcpCreateDraftsSchema>,
) {
  return queryOptions({
    queryKey: ["subsectionMcpCreateDrafts", input],
    queryFn: () => listSubsectionMcpCreateDraftsFn({ data: input }),
  })
}

export function mcpDraftsGroupedQueryOptions() {
  return queryOptions({
    queryKey: ["mcpDraftsGrouped"],
    queryFn: () => listMcpDraftsGroupedFn(),
  })
}

export async function invalidateMcpDraftQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: ["subsubsectionMcpDraft"] })
  await queryClient.invalidateQueries({ queryKey: ["subsectionMcpCreateDrafts"] })
  await queryClient.invalidateQueries({ queryKey: ["mcpDraftsGrouped"] })
}
