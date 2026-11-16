import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import {
  getMyBookmarkedSubsubsectionsFn,
  getSubsubsectionBookmarkFn,
} from "./subsubsectionBookmarks.functions"
import type {
  GetMyBookmarkedSubsubsectionsSchema,
  GetSubsubsectionBookmarkSchema,
} from "./subsubsectionBookmarks.inputSchemas"

// Both keys start with this prefix, so one invalidation refreshes the toggle and the lists.
export const subsubsectionBookmarksQueryKey = ["subsubsectionBookmarks"] as const

export function myBookmarkedSubsubsectionsQueryOptions(
  input: z.infer<typeof GetMyBookmarkedSubsubsectionsSchema> = {},
) {
  return queryOptions({
    queryKey: [
      ...subsubsectionBookmarksQueryKey,
      "mine",
      input.projectSlug ?? null,
      input.limit ?? null,
    ],
    queryFn: () => getMyBookmarkedSubsubsectionsFn({ data: input }),
  })
}

export function subsubsectionBookmarkQueryOptions(
  input: z.infer<typeof GetSubsubsectionBookmarkSchema>,
) {
  return queryOptions({
    queryKey: [...subsubsectionBookmarksQueryKey, "single", input],
    queryFn: () => getSubsubsectionBookmarkFn({ data: input }),
  })
}
