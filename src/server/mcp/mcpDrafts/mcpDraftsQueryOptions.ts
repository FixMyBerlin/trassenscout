import { type QueryClient, queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import {
  getSubsectionMcpDraftFn,
  getSubsubsectionMcpDraftFn,
  listMcpDraftsGroupedFn,
  listProjectSubsectionMcpCreateDraftsFn,
  listSubsectionMcpCreateDraftsFn,
} from "./mcpDrafts.functions"
import type {
  GetSubsectionMcpDraftSchema,
  GetSubsubsectionMcpDraftSchema,
  ListProjectSubsectionMcpCreateDraftsSchema,
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

export function subsectionMcpDraftQueryOptions(input: z.infer<typeof GetSubsectionMcpDraftSchema>) {
  return queryOptions({
    queryKey: ["subsectionMcpDraft", input],
    queryFn: () => getSubsectionMcpDraftFn({ data: input }),
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

export function projectSubsectionMcpCreateDraftsQueryOptions(
  input: z.infer<typeof ListProjectSubsectionMcpCreateDraftsSchema>,
) {
  return queryOptions({
    queryKey: ["projectSubsectionMcpCreateDrafts", input],
    queryFn: () => listProjectSubsectionMcpCreateDraftsFn({ data: input }),
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
  await queryClient.invalidateQueries({ queryKey: ["subsectionMcpDraft"] })
  await queryClient.invalidateQueries({ queryKey: ["subsectionMcpCreateDrafts"] })
  await queryClient.invalidateQueries({ queryKey: ["projectSubsectionMcpCreateDrafts"] })
  await queryClient.invalidateQueries({ queryKey: ["mcpDraftsGrouped"] })
}
