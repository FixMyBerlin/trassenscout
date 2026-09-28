import type { CursorPage } from "@/src/shared/pagination/types"

/** `rows` must be queried with `take + 1`. */
export function toCursorPage<TItem, TCursor>(
  rows: TItem[],
  take: number,
  cursorOf: (item: TItem) => TCursor,
): CursorPage<TItem, TCursor> {
  const items = rows.slice(0, take)
  const last = items.at(-1)
  return { items, nextCursor: rows.length > take && last ? cursorOf(last) : null }
}
