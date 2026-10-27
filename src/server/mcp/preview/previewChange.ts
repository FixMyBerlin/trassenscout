type McpPreviewChangeKind = "set" | "overwrite" | "clear"

export type McpPreviewChange = {
  field: string
  label: string
  kind: McpPreviewChangeKind
  proposed: unknown
}

type FieldLabel = (field: string) => string

export function formatPreviewWarning(change: McpPreviewChange) {
  if (change.kind === "clear") return `${change.label} wird geleert.`
  return `${change.label} wird überschrieben.`
}

function isEmptyCurrentValue(value: unknown) {
  if (value === null || value === undefined) return true
  if (value === "") return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function valuesEqual(a: unknown, b: unknown) {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
  return a === b
}

export function pushSet(
  changes: McpPreviewChange[],
  fieldLabel: FieldLabel,
  field: string,
  proposed: unknown,
) {
  changes.push({ field, label: fieldLabel(field), kind: "set", proposed })
}

export function pushChange(
  changes: McpPreviewChange[],
  fieldLabel: FieldLabel,
  field: string,
  current: unknown,
  proposed: unknown,
) {
  if (valuesEqual(current, proposed)) return false
  changes.push({
    field,
    label: fieldLabel(field),
    kind: isEmptyCurrentValue(current) ? "set" : "overwrite",
    proposed,
  })
  return true
}

export function pushClear(
  changes: McpPreviewChange[],
  notes: string[],
  fieldLabel: FieldLabel,
  field: string,
  current: unknown,
) {
  if (isEmptyCurrentValue(current)) {
    notes.push(`${fieldLabel(field)} ist bereits leer.`)
    return false
  }
  changes.push({ field, label: fieldLabel(field), kind: "clear", proposed: null })
  return true
}

export function clearFieldLabels(fields: readonly string[], fieldLabel: FieldLabel) {
  return fields.map((field) => `${fieldLabel(field)} (leeren)`)
}
