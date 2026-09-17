import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import { getGeneralLogEntriesFn, getLogEntriesFn } from "./logEntries.functions"
import type { GetLogEntriesSchema } from "./logEntries.inputSchemas"

export function generalLogEntriesQueryOptions() {
  return queryOptions({
    queryKey: ["logEntries", "general"],
    queryFn: () => getGeneralLogEntriesFn(),
  })
}

export function logEntriesQueryOptions(input: z.infer<typeof GetLogEntriesSchema> = {}) {
  return queryOptions({
    queryKey: [
      "logEntries",
      "list",
      input.projectSlug ?? null,
      input.months ?? null,
      input.take ?? null,
    ],
    queryFn: () => getLogEntriesFn({ data: input }),
  })
}
