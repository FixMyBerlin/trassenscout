import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { SubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsectionIcon"
import { getIconIdForSubsection } from "@/src/components/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/components/core/components/Map/utils/geometryTypeTranslations"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { SubsectionsList } from "@/src/server/subsections/types"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsections: SubsectionsList
  createButton?: boolean
}

const tableHeadClasses = "pl-4 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900  "

export const SubsectionTable = ({ subsections, createButton = true }: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const hasAnySubsubsections = subsections.some((s) => (s.subsubsectionCount ?? 0) > 0)

  return (
    <section>
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className={twJoin("sm:pl-6", tableHeadClasses)}>
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
                Maßnahmen
              </th>
              <th scope="col" className={tableHeadClasses}>
                Fertigstellung
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsections.map((subsection) => (
              <tr
                key={subsection.id}
                className="group cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  void navigate({
                    to: "/$projectSlug/abschnitte/$subsectionSlug",
                    params: { projectSlug, subsectionSlug: subsection.slug },
                  })
                }
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
                  className={twJoin(
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
            ))}
          </tbody>
        </table>
        {!subsections.length && <ZeroCase visible name="Planungsabschnitte" />}
      </TableWrapper>

      {createButton && (
        <IfUserCanEdit>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              button="blue"
              icon="plus"
              to="/$projectSlug/abschnitte/new"
              params={{ projectSlug }}
            >
              Neuer Planungsabschnitt
            </Link>
            {hasAnySubsubsections && (
              <Link button="white" icon="download" href={`/api/${projectSlug}/subsections/export`}>
                Alle Maßnahmen herunterladen (CSV)
              </Link>
            )}
          </div>
        </IfUserCanEdit>
      )}
    </section>
  )
}
