import { twJoin } from "tailwind-merge"
import { SubsubsectionTable } from "@/src/components/abschnitte/SubsubsectionTable"
import {
  collapsedSubsectionSlugs,
  searchMatchSummary,
  subsectionMatchSummary,
  subsubsectionMatchSummary,
} from "@/src/components/abschnitte/utils/filterSubsubsections"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { Spinner } from "@/src/components/core/components/Spinner"
import { FilteredZeroCase } from "@/src/components/core/components/text/FilteredZeroCase"
import { quote } from "@/src/components/core/components/text/quote"
import type { SubsectionsList } from "@/src/server/subsections/types"
import type { SubsubsectionsList } from "@/src/server/subsubsections/types"
import { SubsectionTable } from "./SubsectionTable"
import {
  useSubsubsectionSearchGroupOverrides,
  useSubsubsectionSearchGroupsActions,
} from "./subsubsection-search-groups-store"

type Props = {
  results:
    | {
        subsectionMatches: SubsectionsList
        subsubsectionMatches: SubsubsectionsList
        slugsWithSubsubsectionMatches: ReadonlySet<string>
      }
    | undefined
  searchterm: string
  onReset: () => void
}

const countLineClassName = "border-b border-gray-200 px-4 py-2 text-sm"

export const ProjectSearchResults = ({ results, searchterm, onReset }: Props) => {
  const overrides = useSubsubsectionSearchGroupOverrides(searchterm)
  const { collapseGroups, expandGroups } = useSubsubsectionSearchGroupsActions()

  if (!results) return <Spinner page />

  const { subsectionMatches, subsubsectionMatches, slugsWithSubsubsectionMatches } = results
  if (!subsectionMatches.length && !subsubsectionMatches.length) {
    return <FilteredZeroCase name="Planungsabschnitte oder Maßnahmen" onReset={onReset} />
  }

  const groupSlugs = [...slugsWithSubsubsectionMatches]
  const collapsedSlugs = collapsedSubsectionSlugs(subsubsectionMatches, overrides)
  const allCollapsed = collapsedSlugs.size === groupSlugs.length
  const forSearchterm = `für ${quote(searchterm.trim())}`

  return (
    <>
      <p role="status" className="sr-only">
        {searchMatchSummary(results)} {forSearchterm}
      </p>
      {subsectionMatches.length ? (
        <>
          <p className={twJoin(countLineClassName, "text-gray-500")}>
            {subsectionMatchSummary(subsectionMatches.length)} {forSearchterm}
          </p>
          <SubsectionTable subsections={subsectionMatches} />
        </>
      ) : null}
      {subsubsectionMatches.length ? (
        <>
          <div className={twJoin(countLineClassName, "flex items-center justify-between gap-4")}>
            <p className="text-gray-500">
              {subsubsectionMatchSummary(subsubsectionMatches.length, groupSlugs.length)}{" "}
              {forSearchterm}
            </p>
            {groupSlugs.length > 1 ? (
              <button
                type="button"
                className={linkStyles}
                onClick={() =>
                  allCollapsed
                    ? expandGroups(searchterm, groupSlugs)
                    : collapseGroups(searchterm, groupSlugs)
                }
              >
                {allCollapsed ? "Alle aufklappen" : "Alle einklappen"}
              </button>
            ) : null}
          </div>
          <SubsubsectionTable
            subsubsections={subsubsectionMatches}
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
      ) : null}
    </>
  )
}
