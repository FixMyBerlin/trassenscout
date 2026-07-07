export type SubsubsectionSlugPair = {
  subsubsectionId: number
  subsectionSlug: string
  subsubsectionSlug: string
}

export type SlugMatchResult =
  | { kind: "matched"; pair: SubsubsectionSlugPair }
  | { kind: "unmatched" }
  | { kind: "ambiguous"; prefix: string }

// Slugs may contain "-", "." and "_" themselves (see SlugSchema), so the filename cannot
// be split on "_". Instead we test the filename against every known slug pair prefix.
const BOUNDARY_CHARS = new Set(["_", "-", "."])

/**
 * Matches a filename against the project's (subsectionSlug, subsubsectionSlug) pairs.
 * Convention: filename starts with `<subsectionSlug>_<subsubsectionSlug>` followed by
 * a boundary char (`_`, `-`, `.`) or the end of the name, e.g. `line-3_point-1_foto.jpg`.
 * The longest matching prefix wins; identical prefixes from distinct pairs are ambiguous.
 */
export function matchSlugFromFilename(
  filename: string,
  pairs: SubsubsectionSlugPair[],
): SlugMatchResult {
  const name = filename.trim().toLowerCase()

  let longestPrefix = ""
  let candidates: SubsubsectionSlugPair[] = []

  for (const pair of pairs) {
    const prefix = `${pair.subsectionSlug.toLowerCase()}_${pair.subsubsectionSlug.toLowerCase()}`
    if (!name.startsWith(prefix)) continue

    const boundary = name[prefix.length]
    if (boundary !== undefined && !BOUNDARY_CHARS.has(boundary)) continue

    if (prefix.length > longestPrefix.length) {
      longestPrefix = prefix
      candidates = [pair]
    } else if (prefix.length === longestPrefix.length) {
      candidates.push(pair)
    }
  }

  if (candidates.length === 0) return { kind: "unmatched" }
  if (candidates.length > 1) return { kind: "ambiguous", prefix: longestPrefix }
  return { kind: "matched", pair: candidates[0]! }
}
