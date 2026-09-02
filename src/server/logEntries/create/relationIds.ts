export function relationIds(rows: { id: number }[] | null | undefined) {
  return rows?.map((row) => row.id) ?? []
}

export function changedRecordKeys(
  previous: Record<string, unknown>,
  updated: Record<string, unknown>,
  omit: readonly string[] = ["id"],
) {
  const omitSet = new Set(omit)
  return Object.keys(updated).filter((key) => {
    if (omitSet.has(key)) return false
    return JSON.stringify(previous[key]) !== JSON.stringify(updated[key])
  })
}
