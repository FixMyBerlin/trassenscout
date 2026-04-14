export function formatPropertyValue(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 0)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function sortedPropertyEntries(props: Record<string, unknown> | null | undefined) {
  if (!props) return []
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b, "de"))
}
