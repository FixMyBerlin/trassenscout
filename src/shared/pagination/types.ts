export type CursorPage<TItem, TCursor> = { items: TItem[]; nextCursor: TCursor | null }

export type PaginationResult = {
  from: number
  to: number
  count: number
  hasMore: boolean
  page: number
  pageSize: number
}
