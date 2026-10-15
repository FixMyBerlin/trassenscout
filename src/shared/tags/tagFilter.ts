import { z } from "zod"

export const tagFilterSchema = z.string().min(1).optional().catch(undefined)

export const searchtermTagFilterSchema = z.object({
  searchterm: z.string().optional(),
  tag: tagFilterSchema,
})

export type SearchtermTagFilter = z.infer<typeof searchtermTagFilterSchema>

export function searchtermTagFilterSearchValue(filter: Partial<SearchtermTagFilter>) {
  const next: Partial<SearchtermTagFilter> = {}
  if (filter.searchterm) next.searchterm = filter.searchterm
  if (filter.tag) next.tag = filter.tag

  return Object.keys(next).length === 0 ? undefined : next
}

export function mergeSearchtermTagFilter(
  previous: SearchtermTagFilter | undefined,
  patch: Partial<SearchtermTagFilter> | undefined,
) {
  return patch && searchtermTagFilterSearchValue({ ...previous, ...patch })
}
