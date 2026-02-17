"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { LegendIcon } from "@/src/core/components/Map/Icons/LegendIcon"
import { getIconIdForSubsection } from "@/src/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/core/components/Map/utils/geometryTypeTranslations"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { subsectionDashboardRoute, subsectionNewRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { clsx } from "clsx"
import { useRouter } from "next/navigation"

type Props = {
  subsections: TSubsections
  createButton?: boolean
}

const tableHeadClasses =
  "pl-4 py-3.5 pr-3 text-left text-sm font-semibold uppercase text-gray-900  "

export const SubsectionTable = ({ subsections, createButton = true }: Props) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()

  return (
    <section>
      <TableWrapper className="mt-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className={clsx("sm:pl-6", tableHeadClasses)}>
                Planungsabschnitt
              </th>
              <th scope="col" className={tableHeadClasses}>
                <span className="sr-only">Geometrietyp</span>
              </th>
              <th scope="col" className={tableHeadClasses}>
                Baulastträger
              </th>
              <th scope="col" className={tableHeadClasses}>
                Status
              </th>
              <th scope="col" className={tableHeadClasses}>
                Einträge
              </th>
              <th scope="col" className={tableHeadClasses}>
                Fertigstellung
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsections.map((subsection) => {
              const route = subsectionDashboardRoute(projectSlug, subsection.slug)
              return (
                <tr
                  key={subsection.id}
                  className="group cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(route)}
                >
                  <td className="size-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                    <SubsectionIcon label={shortTitle(subsection.slug)} />
                  </td>
                  <td className="px-1.5 py-2 text-sm">
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
                  <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                    {subsection.operator?.title || "–"}{" "}
                    {subsection.operator?.slug && (
                      <span className="uppercase">({subsection.operator?.slug})</span>
                    )}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 group-hover:bg-gray-50",
                    )}
                  >
                    {subsection.SubsectionStatus?.title || "–"}
                  </td>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                    {subsection.subsubsectionCount && subsection.subsubsectionCount > 0
                      ? subsection.subsubsectionCount
                      : "–"}
                  </td>
                  <td className="py-4 pr-4 pl-3 text-sm font-medium wrap-break-word sm:pr-6">
                    {subsection.estimatedCompletionDateString || "–"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!subsections.length && <ZeroCase visible name="Planungsabschnitte" />}
      </TableWrapper>

      {createButton && (
        <IfUserCanEdit>
          <Link button="blue" icon="plus" className="mt-4" href={subsectionNewRoute(projectSlug)}>
            Neuer Planungsabschnitt
          </Link>
        </IfUserCanEdit>
      )}
    </section>
  )
}
