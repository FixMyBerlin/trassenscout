import { queryOptions } from "@tanstack/react-query"
import type { Prettify } from "@/src/components/core/types"
import type { Operator } from "@/src/prisma/generated/browser"
import {
  getLookupRowFn,
  getLookupRowsFn,
  getLookupRowsWithCountFn,
} from "./adminLookupTables.functions"
import type { GetLookupRowInput, GetLookupRowsInput } from "./adminLookupTables.inputSchemas"

export type OperatorWithSubsectionCount = Prettify<Operator & { subsectionCount?: number }>

export function adminLookupRowsQueryOptions(input: GetLookupRowsInput) {
  return queryOptions({
    queryKey: ["adminLookupRows", input],
    queryFn: () => getLookupRowsFn({ data: input }),
  })
}

export function adminLookupRowsWithCountQueryOptions(input: GetLookupRowsInput) {
  return queryOptions({
    queryKey: ["adminLookupRowsWithCount", input],
    queryFn: () => getLookupRowsWithCountFn({ data: input }),
  })
}

export function adminLookupRowQueryOptions(input: GetLookupRowInput) {
  return queryOptions({
    queryKey: ["adminLookupRow", input],
    queryFn: () => getLookupRowFn({ data: input }),
  })
}
