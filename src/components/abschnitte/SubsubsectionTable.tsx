import { Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { DocumentTextIcon, PaperClipIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"
import { subsubsectionRowComparator } from "@/src/components/abschnitte/subsubsectionTableSort"
import { hiddenMatchSnippet } from "@/src/components/abschnitte/utils/filterSubsubsections"
import { Link } from "@/src/components/core/components/links/Link"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { SubsubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsubsectionIcon"
import { getIconIdForSubsubsection } from "@/src/components/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/components/core/components/Map/utils/geometryTypeTranslations"
import { SortableTableHeader } from "@/src/components/core/components/Table/SortableTableHeader"
import {
  tableBodyClassName,
  tableCellClassName,
  tableColumnTiers,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { HighlightedText } from "@/src/components/core/components/text/HighlightedText"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"
import type { ProjectUserDto } from "@/src/server/memberships/redactFormerProjectMemberUser.server"
import type { SubsubsectionListRow } from "@/src/server/subsubsections/subsubsections.server"
import type { SubsubsectionTableSortColumn } from "@/src/shared/subsubsections/searchSchemas"
import type { TableSort } from "@/src/shared/tableSort/tableSort"

// Titel has no width: it takes what the fixed columns leave and wraps.
const subsubsectionTableColWidths = {
  slug: "w-28",
  project: "w-24",
  geometry: "w-10",
  lastActivity: "w-32 @xl:w-44 @2xl:w-52",
  counts: "w-14 @4xl:w-24",
} as const

export type SubsubsectionTableRow = SubsubsectionListRow & {
  project: { slug: string }
  /** Only the "Meine Maßnahmen" list sends who last edited the Maßnahme. */
  updatedBy?: ProjectUserDto | null
}

type Props = {
  /** Rendered in the given order unless `sort` is set. */
  rows: SubsubsectionTableRow[]
  showProject?: boolean
  /** Short list beside the dashboard map: no Geometrietyp and no "Zuletzt bearbeitet". */
  compact?: boolean
  /**
   * When false, table is readable only (map-mode screen-reader list): no row navigation,
   * and TableWrapper scroll is off so Firefox does not Tab into the hidden table. Default true.
   */
  interactive?: boolean
  /** Marks the term and quotes the hidden field a row matched in. */
  searchterm?: string
  /** Without `sort`, rows must be ordered so that each Planungsabschnitt is contiguous. */
  subsectionGroups?: {
    collapsedSlugs: ReadonlySet<string>
    onToggle: (subsectionSlug: string) => void
  }
  sort?: TableSort<SubsubsectionTableSortColumn>
  onSortClick?: (column: SubsubsectionTableSortColumn) => void
}

function groupBySubsectionSlug(rows: SubsubsectionTableRow[]) {
  const groups = new Map<string, SubsubsectionTableRow[]>()
  for (const row of rows) {
    const group = groups.get(row.subsection.slug)
    if (group) group.push(row)
    else groups.set(row.subsection.slug, [row])
  }
  return [...groups]
}

export const SubsubsectionTable = ({
  rows,
  showProject = false,
  compact = false,
  interactive = true,
  searchterm,
  subsectionGroups,
  sort,
  onSortClick,
}: Props) => {
  const navigate = useNavigate()
  const sortedRows = sort
    ? [...rows].sort(subsubsectionRowComparator(sort, { grouped: Boolean(subsectionGroups) }))
    : rows
  const headerProps = { sort, onSortClick: interactive ? onSortClick : undefined }
  const currentProjectSlug = useTryRouteParam("projectSlug")
  const currentSubsectionSlug = useTryRouteParam("subsectionSlug")
  const currentSubsubsectionSlug = useTryRouteParam("subsubsectionSlug")
  // Full Titel while searching, so a match late in a long Titel stays visible
  const clampTitle = !normalizeSearchterm(searchterm ?? "")
  // The compact box, the grouped search and the screen-reader copy keep every column
  const tiers = compact || subsectionGroups || !interactive ? undefined : tableColumnTiers

  const renderRow = (row: SubsubsectionTableRow) => {
    const snippet = hiddenMatchSnippet(row, searchterm ?? "")
    const isCurrent =
      row.slug === currentSubsubsectionSlug &&
      row.subsection.slug === currentSubsectionSlug &&
      row.project.slug === currentProjectSlug

    return (
      <tr
        key={row.id}
        className={twJoin(
          tableRowClassName,
          isCurrent ? "bg-gray-100" : interactive && "group cursor-pointer hover:bg-gray-50",
        )}
        onClick={
          interactive
            ? () =>
                void navigate({
                  to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
                  params: {
                    projectSlug: row.project.slug,
                    subsectionSlug: row.subsection.slug,
                    subsubsectionSlug: row.slug,
                  },
                })
            : undefined
        }
      >
        <td className={twJoin(tableCellClassName, "align-top whitespace-nowrap")}>
          {interactive ? (
            // The row click is mouse-only; this link opens the Maßnahme by keyboard and screen reader.
            <Link
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
              params={{
                projectSlug: row.project.slug,
                subsectionSlug: row.subsection.slug,
                subsubsectionSlug: row.slug,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <SubsubsectionIcon slug={row.slug} />
            </Link>
          ) : (
            <SubsubsectionIcon slug={row.slug} />
          )}
        </td>
        {!compact && (
          <td className={twJoin(tableCellClassName, "px-1.5 align-top", tiers?.from576.cell)}>
            <div className="flex h-9 items-center justify-center">
              {row.type ? (
                <Tooltip content={GEOMETRY_TYPE_TOOLTIPS[row.type]}>
                  <LegendIcon
                    iconId={getIconIdForSubsubsection(row.type, row.SubsubsectionStatus?.style)}
                  />
                </Tooltip>
              ) : (
                <Tooltip content="Ohne Geometrie">
                  <span className="text-gray-400">—</span>
                </Tooltip>
              )}
            </div>
          </td>
        )}
        {showProject && (
          <td
            className={twJoin(
              tableCellClassName,
              "align-top font-medium wrap-break-word",
              tiers?.from768.cell,
            )}
          >
            {shortTitle(row.project.slug)}
          </td>
        )}
        {!compact && (
          <td className={twJoin(tableCellClassName, "align-top")}>
            {formatBerlinTime(row.updatedAt, "dd.MM.yyyy, HH:mm")}
            {row.updatedBy ? (
              <div className="text-xs text-gray-500">{getFullname(row.updatedBy)}</div>
            ) : null}
          </td>
        )}
        <td
          className={twJoin(
            tableCellClassName,
            "align-top font-medium wrap-break-word hyphens-auto",
            interactive ? "text-blue-500 group-hover:text-blue-800" : "text-gray-900",
          )}
        >
          {row.subTitle ? (
            <div className={twJoin(clampTitle && "line-clamp-2")}>
              <HighlightedText text={row.subTitle} searchterm={searchterm} />
            </div>
          ) : null}
          {snippet ? (
            <div className="mt-1 text-xs font-normal text-gray-500">
              {snippet.label}: <HighlightedText text={snippet.text} searchterm={searchterm} />
            </div>
          ) : null}
        </td>
        <td className={twJoin(tableCellClassName, "pl-0 align-top", tiers?.from576.cell)}>
          <div className="flex flex-col items-end justify-end gap-1 text-xs tabular-nums @4xl:flex-row @4xl:items-center @4xl:gap-3">
            <span className="flex items-center gap-1">
              <DocumentTextIcon className="size-4 shrink-0" />
              <span className="sr-only">Protokolle: </span>
              {row.projectRecordCount}
            </span>
            <span className="flex items-center gap-1">
              <PaperClipIcon className="size-4 shrink-0" />
              <span className="sr-only">Dokumente: </span>
              {row.uploadCount}
            </span>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <section>
      <TableWrapper scrollable={interactive}>
        <div className="@container w-full">
          <table className={tableFixedClassName}>
            <colgroup>
              <col className={subsubsectionTableColWidths.slug} />
              {!compact && (
                <col className={twJoin(subsubsectionTableColWidths.geometry, tiers?.from576.col)} />
              )}
              {showProject && (
                <col className={twJoin(subsubsectionTableColWidths.project, tiers?.from768.col)} />
              )}
              {!compact && <col className={subsubsectionTableColWidths.lastActivity} />}
              <col />
              <col className={twJoin(subsubsectionTableColWidths.counts, tiers?.from576.col)} />
            </colgroup>
            <thead>
              <tr className={tableHeadRowClassName}>
                <SortableTableHeader column="slug" {...headerProps}>
                  Maßnahmen
                </SortableTableHeader>
                {!compact && (
                  <th scope="col" className={twJoin(tableHeadCellClassName, tiers?.from576.cell)}>
                    <span className="sr-only">Geometrietyp</span>
                  </th>
                )}
                {showProject && (
                  <SortableTableHeader
                    column="project"
                    {...headerProps}
                    className={twJoin(tableHeadCellClassName, tiers?.from768.cell)}
                  >
                    Projekt
                  </SortableTableHeader>
                )}
                {!compact && (
                  <SortableTableHeader column="updatedAt" {...headerProps}>
                    Zuletzt bearbeitet
                  </SortableTableHeader>
                )}
                <SortableTableHeader column="title" {...headerProps}>
                  Titel
                </SortableTableHeader>
                <th scope="col" className={twJoin(tableHeadCellClassName, tiers?.from576.cell)}>
                  <span className="sr-only">Protokolle und Dokumente</span>
                </th>
              </tr>
            </thead>
            {subsectionGroups ? (
              groupBySubsectionSlug(sortedRows).map(([subsectionSlug, groupRows]) => {
                const isCollapsed = subsectionGroups.collapsedSlugs.has(subsectionSlug)
                const toggle = () => subsectionGroups.onToggle(subsectionSlug)
                const projectSlug = groupRows[0]?.project.slug ?? ""

                return (
                  <Fragment key={subsectionSlug}>
                    <tbody className={tableBodyClassName}>
                      <tr
                        className="group cursor-pointer border-b border-gray-200 bg-gray-50 hover:bg-gray-100"
                        onClick={toggle}
                      >
                        <th
                          scope="rowgroup"
                          className={twJoin(
                            tableCellClassName,
                            "text-left font-normal whitespace-nowrap",
                          )}
                        >
                          <SubsectionIcon label={shortTitle(subsectionSlug)} />
                        </th>
                        <td
                          className={twJoin(tableCellClassName, "whitespace-nowrap")}
                          colSpan={showProject ? 3 : 2}
                        >
                          <Link
                            to="/$projectSlug/abschnitte/$subsectionSlug"
                            params={{ projectSlug, subsectionSlug }}
                            search={{ searchterm }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            Planungsabschnitt öffnen
                          </Link>
                        </td>
                        <td colSpan={2} className={twJoin(tableCellClassName, "text-right")}>
                          <button
                            type="button"
                            aria-expanded={!isCollapsed}
                            aria-label={`${groupRows.length} Treffer in ${shortTitle(subsectionSlug)}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              toggle()
                            }}
                            className="inline-flex cursor-pointer items-center gap-3 rounded text-sm whitespace-nowrap text-gray-500 group-hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                          >
                            {groupRows.length} Treffer
                            <ChevronDownIcon
                              aria-hidden="true"
                              className={twJoin(
                                "size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                                !isCollapsed && "rotate-180",
                              )}
                            />
                          </button>
                        </td>
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
                        {groupRows.map(renderRow)}
                      </tbody>
                    </Transition>
                  </Fragment>
                )
              })
            ) : (
              <tbody className={tableBodyClassName}>{sortedRows.map(renderRow)}</tbody>
            )}
          </table>
        </div>
        {!rows.length && (
          <div className="border-t border-gray-200 px-3 py-5">
            <ZeroCase visible={rows.length} name="Maßnahmen" verb="angelegt" />
          </div>
        )}
      </TableWrapper>
    </section>
  )
}
