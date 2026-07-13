type LookupRowsResult = {
  rows?: Array<{ id: number }>
} & Record<string, unknown>

export function lookupTableRows<T extends { id: number }>(data: unknown, tableKey: string) {
  if (!data || typeof data !== "object") return []
  const record = data as LookupRowsResult
  const fromKey = record[tableKey]
  if (Array.isArray(fromKey)) return fromKey as T[]
  if (Array.isArray(record.rows)) return record.rows as T[]
  return []
}
