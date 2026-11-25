import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { getIconIdForSubsection } from "@/src/components/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/components/core/components/Map/utils/geometryTypeTranslations"
import { SortableTableHeader } from "@/src/components/core/components/Table/SortableTableHeader"
import {
  tableBodyClassName,
  tableClassName,
  tableColumnTiers,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import type { SubsectionsList } from "@/src/server/subsections/types"
import {
  SUBSECTION_TABLE_DEFAULT_SORT,
  type SubsectionTableSortColumn,
} from "@/src/shared/projects/searchSchemas"
import { sortRows } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { subsectionSortValues } from "./subsectionTableSort"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsections: SubsectionsList
  /**
   * When false, table is readable only (map-mode screen-reader list): no row navigation,
   * and TableWrapper scroll is off so Firefox does not Tab into the hidden table. Default true.
   */
  interactive?: boolean
  sort?: TableSort<SubsectionTableSortColumn>
  onSortClick?: (column: SubsectionTableSortColumn) => void
}

const tableHeadClasses = tableHeadCellClassName

export const SubsectionTable = ({
  subsections,
  interactive = true,
  sort = SUBSECTION_TABLE_DEFAULT_SORT,
  onSortClick,
}: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const sortedSubsections = sortRows(
    subsections,
    subsectionSortValues,
    sort,
    SUBSECTION_TABLE_DEFAULT_SORT,
  )
  const headerProps = { sort, onSortClick: interactive ? onSortClick : undefined }
  // The screen-reader copy sits in a 1px box, so it keeps every column
  const tiers = interactive ? tableColumnTiers : undefined

  return (
    <section>
      <TableWrapper scrollable={interactive} className="@container">
        <table className={tableClassName}>
          <thead>
            <tr className={tableHeadRowClassName}>
              <SortableTableHeader column="slug" {...headerProps}>
                Planungsabschnitt
              </SortableTableHeader>
              <th scope="col" className={twJoin(tableHeadClasses, tiers?.from1024.cell)}>
                <span className="sr-only">Geometrietyp</span>
              </th>
              <SortableTableHeader
                column="operator"
                {...headerProps}
                className={twJoin(tableHeadClasses, tiers?.from1024.cell)}
              >
                Baulastträger
              </SortableTableHeader>
              <SortableTableHeader column="status" {...headerProps}>
                Status
              </SortableTableHeader>
              <SortableTableHeader
                column="subsubsectionCount"
                {...headerProps}
                className={twJoin(tableHeadClasses, tiers?.from576.cell)}
              >
                Maßnahmen
              </SortableTableHeader>
              <SortableTableHeader
                column="estimatedCompletion"
                {...headerProps}
                className={twJoin(tableHeadClasses, tiers?.from768.cell)}
              >
                Fertigstellung
              </SortableTableHeader>
            </tr>
          </thead>
          <tbody className={tableBodyClassName}>
            {sortedSubsections.map((subsection) => (
              <tr
                key={subsection.id}
                className={twJoin(
                  tableRowClassName,
                  interactive && "group cursor-pointer hover:bg-gray-50",
                )}
                onClick={
                  interactive
                    ? () =>
                        void navigate({
                          to: "/$projectSlug/abschnitte/$subsectionSlug",
                          params: { projectSlug, subsectionSlug: subsection.slug },
                        })
                    : undefined
                }
              >
                <td className="size-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                  <SubsectionIcon
                    label={shortTitle(subsection.slug)}
                    className="@max-xl:h-7 @max-xl:text-sm"
                  />
                </td>
                <td className={twJoin("px-1.5 py-2 text-sm", tiers?.from1024.cell)}>
                  <div className="flex items-center justify-center">
                    <Tooltip content={GEOMETRY_TYPE_TOOLTIPS[subsection.type]}>
                      <LegendIcon
                        iconId={getIconIdForSubsection(
                          subsection.type,
                          subsection.SubsectionStatus?.style,
                        )}
                      />
                    </Tooltip>
                  </div>
                </td>
                <td
                  className={twJoin(
                    "py-4 pr-3 pl-4 text-sm font-medium text-gray-900",
                    tiers?.from1024.cell,
                    interactive && "group-hover:bg-gray-50",
                  )}
                >
                  {subsection.operator?.title || "–"}{" "}
                  {subsection.operator?.slug && (
                    <span className="uppercase">({subsection.operator?.slug})</span>
                  )}
                </td>
                <td
                  className={twJoin(
                    "py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900",
                    interactive && "group-hover:bg-gray-50",
                  )}
                >
                  {subsection.SubsectionStatus?.title || "–"}
                </td>
                <td
                  className={twJoin(
                    "py-4 pr-3 pl-4 text-sm font-medium text-gray-900",
                    tiers?.from576.cell,
                    interactive && "group-hover:bg-gray-50",
                  )}
                >
                  {subsection.subsubsectionCount && subsection.subsubsectionCount > 0
                    ? subsection.subsubsectionCount
                    : "–"}
                </td>
                <td
                  className={twJoin(
                    "py-4 pr-4 pl-3 text-sm font-medium wrap-break-word sm:pr-6",
                    tiers?.from768.cell,
                  )}
                >
                  {subsection.estimatedCompletionDateString || "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!subsections.length && <ZeroCase visible name="Planungsabschnitte" />}
      </TableWrapper>
    </section>
  )
}
