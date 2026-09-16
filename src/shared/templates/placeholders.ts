export type PlaceholderContext = Record<string, string | number | null | undefined>

const createPlaceholderRegex = () => /\{\{\s*([\p{L}\p{N}_]+)\s*\}\}/gu

/** Deduplicated, in first-seen order. */
export const extractPlaceholders = (value: string | null | undefined) => {
  if (!value) return []

  const names = new Set<string>()
  for (const match of value.matchAll(createPlaceholderRegex())) {
    const name = match[1]?.trim()
    if (name) names.add(name)
  }

  return Array.from(names)
}

/** Unknown or empty values become "". */
export const replacePlaceholders = (value: string, context: PlaceholderContext) =>
  value.replace(createPlaceholderRegex(), (_, name: string) => context[name]?.toString() ?? "")
