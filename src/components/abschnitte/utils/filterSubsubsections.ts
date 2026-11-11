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

const toSlugForm = (cleanedSearchterm: string) =>
  cleanedSearchterm
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/\s+/g, "-")

export function filterSubsections<T extends { slug: string }>(
  subsections: T[],
  searchterm: string,
) {
  const cleanedSearchterm = normalizeSearchterm(searchterm)
  if (!cleanedSearchterm) return subsections

  const slugSearchterm = toSlugForm(cleanedSearchterm)
  return subsections.filter(({ slug }) => slug.toLowerCase().includes(slugSearchterm))
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

  const taskTitle = subsubsection.SubsubsectionTask?.title
  if (matches(subsubsection.slug) || matches(subsubsection.subTitle)) return null
  if (taskTitle && matches(taskTitle)) return { label: "Maßnahmentyp", text: taskTitle }
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

const countLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

export function subsectionMatchSummary(matchCount: number) {
  return countLabel(matchCount, "Planungsabschnitt", "Planungsabschnitte")
}

export function subsubsectionMatchSummary(matchCount: number, subsectionCount: number) {
  const massnahmen = countLabel(matchCount, "Maßnahme", "Maßnahmen")
  const abschnitte = countLabel(subsectionCount, "Planungsabschnitt", "Planungsabschnitten")

  return `${massnahmen} in ${abschnitte}`
}

/** Planungsabschnitte match by Kürzel, Maßnahmen by their own fields. */
export function projectSearchResults<
  S extends { id: number; slug: string },
  T extends SearchableSubsubsection & { subsectionId: number; subsection: { slug: string } },
>(subsections: S[], subsubsections: T[], searchterm: string) {
  const subsectionIds = new Set(subsections.map(({ id }) => id))
  const subsectionMatches = filterSubsections(subsections, searchterm)
  const subsubsectionMatches = filterSubsubsections(subsubsections, searchterm).filter(
    ({ subsectionId }) => subsectionIds.has(subsectionId),
  )
  const slugsWithSubsubsectionMatches = new Set(
    subsubsectionMatches.map(({ subsection }) => subsection.slug),
  )

  return {
    subsectionMatches,
    subsubsectionMatches,
    slugsWithSubsubsectionMatches,
    matchedSubsectionSlugs: new Set([
      ...subsectionMatches.map(({ slug }) => slug),
      ...slugsWithSubsubsectionMatches,
    ]),
  }
}

export function searchMatchSummary({
  subsectionMatches,
  subsubsectionMatches,
  slugsWithSubsubsectionMatches,
}: {
  subsectionMatches: readonly unknown[]
  subsubsectionMatches: readonly unknown[]
  slugsWithSubsubsectionMatches: ReadonlySet<string>
}) {
  if (!subsubsectionMatches.length) return subsectionMatchSummary(subsectionMatches.length)
  if (!subsectionMatches.length) {
    return subsubsectionMatchSummary(
      subsubsectionMatches.length,
      slugsWithSubsubsectionMatches.size,
    )
  }
  return `${subsectionMatchSummary(subsectionMatches.length)} und ${countLabel(subsubsectionMatches.length, "Maßnahme", "Maßnahmen")}`
}
