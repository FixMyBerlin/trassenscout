import { SubsubsectionTable } from "@/src/components/abschnitte/SubsubsectionTable"
import {
  collapsedSubsectionSlugs,
  subsubsectionMatchSummary,
} from "@/src/components/abschnitte/utils/filterSubsubsections"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Spinner } from "@/src/components/core/components/Spinner"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { quote } from "@/src/components/core/components/text/quote"
import type { SubsubsectionsList } from "@/src/server/subsubsections/types"
import {
  useSubsubsectionSearchGroupOverrides,
  useSubsubsectionSearchGroupsActions,
} from "./subsubsection-search-groups-store"

type Props = {
  matches: SubsubsectionsList | undefined
  searchterm: string
  onReset: () => void
}

export const ProjectSubsubsectionSearchResults = ({ matches, searchterm, onReset }: Props) => {
  const overrides = useSubsubsectionSearchGroupOverrides(searchterm)
  const { collapseGroups, expandGroups } = useSubsubsectionSearchGroupsActions()

  if (!matches) return <Spinner page />
  if (!matches.length) return <FilteredZeroCase name="Maßnahmen" onReset={onReset} />

  const subsectionSlugs = [...new Set(matches.map(({ subsection }) => subsection.slug))]
  const collapsedSlugs = collapsedSubsectionSlugs(matches, overrides)
  const allCollapsed = collapsedSlugs.size === subsectionSlugs.length

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-2 text-sm">
        <p role="status" className="text-gray-500">
          {subsubsectionMatchSummary(matches.length, subsectionSlugs.length)} für{" "}
          {quote(searchterm.trim())}
        </p>
        {subsectionSlugs.length > 1 ? (
          <button
            type="button"
            className={linkStyles}
            onClick={() =>
              allCollapsed
                ? expandGroups(searchterm, subsectionSlugs)
                : collapseGroups(searchterm, subsectionSlugs)
            }
          >
            {allCollapsed ? "Alle aufklappen" : "Alle einklappen"}
          </button>
        ) : null}
      </div>
      <SubsubsectionTable
        subsubsections={matches}
        compact={false}
        searchterm={searchterm}
        subsectionGroups={{
          collapsedSlugs,
          onToggle: (subsectionSlug) =>
            collapsedSlugs.has(subsectionSlug)
              ? expandGroups(searchterm, [subsectionSlug])
              : collapseGroups(searchterm, [subsectionSlug]),
        }}
      />
    </>
  )
}
