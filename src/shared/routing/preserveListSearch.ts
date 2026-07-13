import { toPageSearchParams } from "@/src/shared/pagination/toPageSearchParams"

export function preserveFromSearch(search: { from?: string }) {
  return search.from ? { from: search.from } : {}
}

export function preservePaginatedListSearch(
  search: { from?: string; page?: number; pageSize?: number },
  { defaultPageSize = 25 }: { defaultPageSize?: number } = {},
) {
  return {
    ...preserveFromSearch(search),
    ...toPageSearchParams(
      { page: search.page ?? 1, pageSize: search.pageSize ?? defaultPageSize },
      { defaultPageSize },
    ),
  }
}
