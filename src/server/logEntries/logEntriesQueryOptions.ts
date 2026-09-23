import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import { getGeneralLogEntriesFn, getLogEntriesFn } from "./logEntries.functions"
import type { LogEntriesCursor } from "./types"

type LogEntriesListInput = {
  projectSlug?: string
  months?: number
}

export function generalLogEntriesQueryOptions() {
  return queryOptions({
    queryKey: ["logEntries", "general"],
    queryFn: () => getGeneralLogEntriesFn(),
  })
}

export function logEntriesInfiniteQueryOptions(input: LogEntriesListInput = {}) {
  return infiniteQueryOptions({
    queryKey: ["logEntries", "list", input.projectSlug ?? null, input.months ?? null],
    queryFn: ({ pageParam }) =>
      getLogEntriesFn({
        data: { ...input, cursor: pageParam ?? undefined },
      }),
    initialPageParam: null as LogEntriesCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Infinite queries refetch every loaded page; keep that off the focus event.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
