/** Swaps an item with its neighbour. Returns the original array when the move is out of bounds. */
export function moveItem<T>(items: T[], index: number, direction: "up" | "down"): T[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1
  const item = items[index]
  const swapWith = items[targetIndex]
  if (item === undefined || swapWith === undefined) return items

  const next = [...items]
  next[index] = swapWith
  next[targetIndex] = item
  return next
}
