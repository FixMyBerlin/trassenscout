type SubsubsectionPreviewChangeKind = "set" | "overwrite"

export type SubsubsectionPreviewChange = {
  field: string
  label: string
  kind: SubsubsectionPreviewChangeKind
  proposed: unknown
}

export function formatPreviewWarning(change: SubsubsectionPreviewChange) {
  return `${change.label} wird überschrieben.`
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
