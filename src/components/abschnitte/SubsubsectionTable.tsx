import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"
import { LegendIcon } from "@/src/components/core/components/Map/Icons/LegendIcon"
import { SubsubsectionIcon } from "@/src/components/core/components/Map/Icons/SubsubsectionIcon"
import { getIconIdForSubsubsection } from "@/src/components/core/components/Map/legendIconRegistry"
import { GEOMETRY_TYPE_TOOLTIPS } from "@/src/components/core/components/Map/utils/geometryTypeTranslations"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import {
  formattedEuro,
  formattedLength,
} from "@/src/components/core/components/text/formattedProperties"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { Route as subsectionRoute } from "@/src/routes/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/index"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { SubsubsectionTableFooter } from "./SubsubsectionTableFooter"

const subsectionRouteApi = getRouteApi(subsectionRoute.id)

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  compact: boolean
}

export const SubsubsectionTable = ({ subsubsections, compact }: Props) => {
  const navigate = useNavigate()
  const { projectSlug, subsectionSlug } = subsectionRouteApi.useParams()
  const subsubsectionSlug = useTryRouteParam("subsubsectionSlug")

  return (
    <section>
      <TableWrapper flushTop>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Maßnahmen
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Maßnahmentyp
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <span className="sr-only">Geometrietyp</span>
              </th>
              <th
                scope="col"
                className={twJoin(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Länge
              </th>
              <th
                scope="col"
                className={twJoin(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Kostenschätzung
              </th>
              <th
                scope="col"
                className={twJoin(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Ausbaustandard
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsections.map((subsubsection) => (
              <tr
                key={subsubsection.id}
                className={twJoin(
                  subsubsection.slug === subsubsectionSlug
                    ? "bg-gray-100"
                    : "group cursor-pointer hover:bg-gray-50",
                )}
                onClick={() =>
                  void navigate({
                    to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
                    params: {
                      projectSlug,
                      subsectionSlug: subsectionSlug!,
                      subsubsectionSlug: subsubsection.slug,
                    },
                  })
                }
              >
                <td className="size-20 py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                  <SubsubsectionIcon slug={subsubsection.slug} />
                </td>
                <td className="py-4 pr-3 pl-4 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                  {subsubsection.SubsubsectionTask?.title || "k.A."}
                </td>
                <td className="px-1.5 py-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Tooltip content={GEOMETRY_TYPE_TOOLTIPS[subsubsection.type]}>
                      <LegendIcon
                        iconId={getIconIdForSubsubsection(
                          subsubsection.type,
                          subsubsection.SubsubsectionStatus?.style,
                        )}
                      />
                    </Tooltip>
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
            ))}
          </tbody>
          <SubsubsectionTableFooter subsubsections={subsubsections} compact={compact} />
        </table>
        {!subsubsections.length && (
          <div className="border-t border-gray-200 px-3 py-5">
            <ZeroCase visible={subsubsections.length} name="Maßnahmen" verb="angelegt" />
          </div>
        )}
      </TableWrapper>

      {subsubsections.length > 0 && (
        <IfUserCanEdit>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              button="white"
              icon="download"
              href={`/api/${projectSlug}/subsections/${subsectionSlug}/subsubsections/export`}
            >
              Maßnahmen herunterladen (CSV)
            </Link>
          </div>
        </IfUserCanEdit>
      )}
    </section>
  )
}
