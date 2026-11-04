import { Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { hiddenMatchSnippet } from "@/src/components/abschnitte/utils/filterSubsubsections"
import { Link } from "@/src/components/core/components/links/Link"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { SubsubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsubsectionIcon"
import { getIconIdForSubsubsection } from "@/src/components/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/components/core/components/Map/utils/geometryTypeTranslations"
import {
  tableBodyClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import {
  formattedEuro,
  formattedLength,
} from "@/src/components/core/components/text/formattedProperties"
import { HighlightedText } from "@/src/components/core/components/text/HighlightedText"
import { compareSlugs, shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { SubsubsectionTableFooter } from "./SubsubsectionTableFooter"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  compact: boolean
  /**
   * When false, table is readable only (map-mode screen-reader list): no row navigation,
   * and TableWrapper scroll is off so Firefox does not Tab into the hidden table. Default true.
   */
  interactive?: boolean
  /** Marks the term and quotes the hidden field a row matched in. */
  searchterm?: string
  subsectionGroups?: {
    collapsedSlugs: ReadonlySet<string>
    onToggle: (subsectionSlug: string) => void
  }
}

function groupBySubsectionSlug(subsubsections: SubsubsectionWithPosition[]) {
  const groups = new Map<string, SubsubsectionWithPosition[]>()
  for (const subsubsection of subsubsections) {
    const group = groups.get(subsubsection.subsection.slug)
    if (group) group.push(subsubsection)
    else groups.set(subsubsection.subsection.slug, [subsubsection])
  }
  return [...groups]
}

export const SubsubsectionTable = ({
  subsubsections,
  compact,
  interactive = true,
  searchterm,
  subsectionGroups,
}: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const subsubsectionSlug = useTryRouteParam("subsubsectionSlug")
  const sortedSubsubsections = [...subsubsections].sort(
    (a, b) => compareSlugs(a.subsection.slug, b.subsection.slug) || compareSlugs(a.slug, b.slug),
  )

  const renderRow = (subsubsection: SubsubsectionWithPosition) => {
    const snippet = hiddenMatchSnippet(subsubsection, searchterm ?? "")

    return (
      <tr
        key={subsubsection.id}
        className={twJoin(
          tableRowClassName,
          subsubsection.slug === subsubsectionSlug
            ? "bg-gray-100"
            : interactive && "group cursor-pointer hover:bg-gray-50",
        )}
        onClick={
          interactive
            ? () =>
                void navigate({
                  to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
                  params: {
                    projectSlug,
                    subsectionSlug: subsubsection.subsection.slug,
                    subsubsectionSlug: subsubsection.slug,
                  },
                })
            : undefined
        }
      >
        <td className="size-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
          <SubsubsectionIcon slug={subsubsection.slug} />
        </td>
        <td
          className={twJoin(
            "py-4 pr-3 pl-4 text-sm font-medium",
            interactive ? "text-blue-500 group-hover:text-blue-800" : "text-gray-900",
          )}
        >
          <HighlightedText
            text={subsubsection.SubsubsectionTask?.title || "k.A."}
            searchterm={searchterm}
          />
          {snippet ? (
            <div className="mt-1 text-xs font-normal text-gray-500">
              {snippet.label}: <HighlightedText text={snippet.text} searchterm={searchterm} />
            </div>
          ) : null}
        </td>
        <td className="px-1.5 py-2 text-sm">
          <div className="flex items-center justify-center">
            {subsubsection.type ? (
              <Tooltip content={GEOMETRY_TYPE_TOOLTIPS[subsubsection.type]}>
                <LegendIcon
                  iconId={getIconIdForSubsubsection(
                    subsubsection.type,
                    subsubsection.SubsubsectionStatus?.style,
                  )}
                />
              </Tooltip>
            ) : (
              <Tooltip content="Ohne Geometrie">
                <span className="text-gray-400">—</span>
              </Tooltip>
            )}
          </div>
        </td>
        <td
          className={twJoin(
            compact ? "hidden" : "",
            "py-4 pr-3 pl-4 text-sm font-medium text-gray-900",
          )}
        >
          {formattedLength(subsubsection.lengthM)}
        </td>
        <td
          className={twJoin(
            compact ? "hidden" : "",
            "py-4 pr-3 pl-4 text-sm font-medium text-gray-900",
          )}
        >
          {formattedEuro(subsubsection.costEstimate)}
        </td>
        <td
          className={twJoin(
            compact ? "hidden" : "",
            "py-4 pr-3 pl-4 text-sm font-medium text-gray-900",
          )}
        >
          {subsubsection.qualityLevel?.title || "k.A."}
        </td>
      </tr>
    )
  }

  return (
    <section>
      <TableWrapper scrollable={interactive}>
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <th scope="col" className={tableHeadCellClassName}>
                Maßnahmen
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                Maßnahmentyp
              </th>
              <th scope="col" className={tableHeadCellClassName}>
                <span className="sr-only">Geometrietyp</span>
              </th>
              <th scope="col" className={twJoin(compact ? "hidden" : "", tableHeadCellClassName)}>
                Länge
              </th>
              <th scope="col" className={twJoin(compact ? "hidden" : "", tableHeadCellClassName)}>
                Kostenschätzung
              </th>
              <th scope="col" className={twJoin(compact ? "hidden" : "", tableHeadCellClassName)}>
                Ausbaustandard
              </th>
            </tr>
          </thead>
          {subsectionGroups ? (
            groupBySubsectionSlug(sortedSubsubsections).map(([subsectionSlug, rows]) => {
              const isCollapsed = subsectionGroups.collapsedSlugs.has(subsectionSlug)

              return (
                <Fragment key={subsectionSlug}>
                  <tbody className={tableBodyClassName}>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th
                        scope="rowgroup"
                        colSpan={6}
                        className="relative h-20 py-4 pr-12 pl-4 text-left text-sm font-normal text-gray-500 sm:pl-6"
                      >
                        <button
                          type="button"
                          aria-expanded={!isCollapsed}
                          aria-label={`Treffer in ${shortTitle(subsectionSlug)}`}
                          onClick={() => subsectionGroups.onToggle(subsectionSlug)}
                          className="absolute inset-0 flex cursor-pointer items-center justify-end pr-4 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500"
                        >
                          <ChevronDownIcon
                            aria-hidden="true"
                            className={twJoin(
                              "size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                              !isCollapsed && "rotate-180",
                            )}
                          />
                        </button>
                        <div className="pointer-events-none relative flex items-center gap-3">
                          <SubsectionIcon label={shortTitle(subsectionSlug)} />
                          <span>{rows.length} Treffer</span>
                          <Link
                            className="pointer-events-auto"
                            to="/$projectSlug/abschnitte/$subsectionSlug"
                            params={{ projectSlug, subsectionSlug }}
                            search={{ searchterm }}
                          >
                            Planungsabschnitt öffnen
                          </Link>
                        </div>
                      </th>
                    </tr>
                  </tbody>
                  {/* Fade only: table rows can't animate their height like our other accordions. */}
                  <Transition show={!isCollapsed}>
                    <tbody
                      className={twJoin(
                        tableBodyClassName,
                        "transition-opacity duration-200 ease-out data-closed:opacity-0 motion-reduce:transition-none",
                      )}
                    >
                      {rows.map(renderRow)}
                    </tbody>
                  </Transition>
                </Fragment>
              )
            })
          ) : (
            <tbody className={tableBodyClassName}>{sortedSubsubsections.map(renderRow)}</tbody>
          )}
          <SubsubsectionTableFooter subsubsections={subsubsections} compact={compact} />
        </table>
        {!subsubsections.length && (
          <div className="border-t border-gray-200 px-3 py-5">
            <ZeroCase visible={subsubsections.length} name="Maßnahmen" verb="angelegt" />
          </div>
        )}
      </TableWrapper>
    </section>
  )
}
