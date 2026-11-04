import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"

type SearchableSubsubsection = Pick<
  SubsubsectionWithPosition,
  "slug" | "subTitle" | "description" | "SubsubsectionTask"
>

export function filterSubsubsections<T extends SearchableSubsubsection>(
  subsubsections: T[],
  searchterm: string,
) {
  const cleanedSearchterm = normalizeSearchterm(searchterm)
  if (!cleanedSearchterm) return subsubsections

  return subsubsections.filter((subsubsection) =>
    [
      subsubsection.slug,
      subsubsection.subTitle,
      subsubsection.SubsubsectionTask?.title,
      subsubsection.description,
    ].some((value) => value?.toLowerCase().includes(cleanedSearchterm)),
  )
}

function excerptAround(text: string, cleanedSearchterm: string) {
  const flatText = text.replace(/\s+/g, " ").trim()
  const matchIndex = Math.max(0, flatText.toLowerCase().indexOf(cleanedSearchterm))
  const start = Math.max(0, matchIndex - 30)
  const end = matchIndex + cleanedSearchterm.length + 60

  return `${start > 0 ? "…" : ""}${flatText.slice(start, end)}${end < flatText.length ? "…" : ""}`
}

/** The field to quote when a row matched only in text the table does not show. */
export function hiddenMatchSnippet(subsubsection: SearchableSubsubsection, searchterm: string) {
  const cleanedSearchterm = normalizeSearchterm(searchterm)
  if (!cleanedSearchterm) return null

  const matches = (value: string | null | undefined) =>
    value?.toLowerCase().includes(cleanedSearchterm)

  if (matches(subsubsection.slug) || matches(subsubsection.SubsubsectionTask?.title)) return null
  if (subsubsection.subTitle && matches(subsubsection.subTitle)) {
    return { label: "Titel", text: subsubsection.subTitle }
  }
  if (subsubsection.description && matches(subsubsection.description)) {
    return {
      label: "Beschreibung",
      text: excerptAround(subsubsection.description, cleanedSearchterm),
    }
  }
  return null
}

const START_CLOSED_ABOVE_MATCH_COUNT = 100

/** A search starts with all groups open or all closed; toggled groups stay as the user set them. */
export function collapsedSubsectionSlugs(
  matches: { subsection: { slug: string } }[],
  overrides: ReadonlyMap<string, boolean>,
) {
  const subsectionSlugs = [...new Set(matches.map(({ subsection }) => subsection.slug))]
  const startClosed = subsectionSlugs.length > 1 && matches.length > START_CLOSED_ABOVE_MATCH_COUNT

  return new Set(subsectionSlugs.filter((slug) => overrides.get(slug) ?? startClosed))
}

export function subsubsectionMatchSummary(matchCount: number, subsectionCount: number) {
  const massnahmen = matchCount === 1 ? "1 Maßnahme" : `${matchCount} Maßnahmen`
  const abschnitte =
    subsectionCount === 1 ? "1 Planungsabschnitt" : `${subsectionCount} Planungsabschnitten`

  return `${massnahmen} in ${abschnitte}`
}
