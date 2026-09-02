type FuehrungPreviewChangeKind = "set" | "overwrite"

export type FuehrungPreviewChange = {
  field: string
  label: string
  kind: FuehrungPreviewChangeKind
  current: unknown
  proposed: unknown
}

export function formatPreviewWarning(change: FuehrungPreviewChange) {
  return `${change.label} hat bereits den Wert ${formatPreviewValue(change.current)} und wird auf ${formatPreviewValue(change.proposed)} überschrieben.`
}

function formatPreviewValue(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return JSON.stringify(value)
}

export function isEmptyCurrentValue(value: unknown) {
  if (value === null || value === undefined) return true
  if (value === "") return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

export function valuesEqual(a: unknown, b: unknown) {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
  return a === b
}
