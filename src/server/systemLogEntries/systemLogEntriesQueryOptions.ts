import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { GetSystemLogEntriesSchema } from "@/src/shared/systemLogEntries/searchSchemas"
import { getSystemLogEntriesFn } from "./systemLogEntries.functions"

export function systemLogEntriesQueryOptions(input: z.infer<typeof GetSystemLogEntriesSchema>) {
  return queryOptions({
    queryKey: ["systemLogEntries", input],
    queryFn: () => getSystemLogEntriesFn({ data: input }),
  })
}
