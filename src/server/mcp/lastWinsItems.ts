/** Dedupes batch items by identity: the last item with the same identity wins, in its position. */
export function lastWinsItems<T>(items: T[], identity: (item: T) => string[]) {
  const map = new Map<string, T>()
  for (const item of items) {
    const key = identity(item).join("\0")
    map.delete(key)
    map.set(key, item)
  }
  return [...map.values()]
}
