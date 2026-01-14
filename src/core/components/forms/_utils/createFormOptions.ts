export const createFormOptions = <T extends { id: number; title: string; slug?: string }>(
  items: T[],
  fieldName: string,
  options?: { optional?: boolean; slugInLabel?: boolean },
): [number | string, string][] => {
  const { optional = false, slugInLabel = false } = options || {}
  const result: [number | string, string][] = []
  if (optional) {
    result.push(["", `${fieldName} offen`])
  }
  for (const item of items) {
    let label = item.title
    if (slugInLabel && item.slug) {
      label = `${item.slug.toUpperCase()} – ${item.title}`
    }
    result.push([item.id, label])
  }
  return result
}
