import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link } from "@/src/core/components/links"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
  longTitle,
  shortTitle,
} from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { useSlugs } from "@/src/core/hooks"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { SubsubsectionWithPosition } from "@/src/subsubsections/queries/getSubsubsection"
import { Routes } from "@blitzjs/next"
import clsx from "clsx"
import { useRouter } from "next/router"
import { mapillaryLink } from "../../subsections/components/utils/mapillaryLink"
import { SubsubsectionTableFooter } from "./SubsubsectionTableFooter"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  compact: boolean
}

export const SubsubsectionTable: React.FC<Props> = ({ subsubsections, compact }) => {
  const router = useRouter()
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <section>
      <TableWrapper className="mt-10">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                colSpan={2}
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Führungen
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Maßnahmentyp
              </th>
              <th
                scope="col"
                className={clsx(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Länge
              </th>
              <th
                scope="col"
                className={clsx(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Breite
              </th>
              <th
                scope="col"
                className={clsx(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Kostenschätzung
              </th>
              <th
                scope="col"
                className={clsx(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                )}
              >
                Ausbaustandard
              </th>
              <th
                scope="col"
                className={clsx(
                  compact ? "hidden" : "",
                  "px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6",
                )}
              >
                -
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsections.map((subsubsection) => {
              const route = Routes.SubsubsectionDashboardPage({
                projectSlug: projectSlug!,
                subsectionSlug: subsectionSlug!,
                subsubsectionSlug: subsubsection.slug,
              })

              const mapillaryHref = mapillaryLink(subsubsection)

              return (
                <tr
                  key={subsubsection.id}
                  className={clsx(
                    subsubsection.slug === subsubsectionSlug
                      ? "bg-gray-100"
                      : "group cursor-pointer hover:bg-gray-50",
                  )}
                  onClick={() => router.push(route, undefined, { scroll: false })}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <SubsubsectionIcon label={shortTitle(subsubsection.slug)} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <strong>{longTitle(subsubsection.slug)}</strong>
                    {subsubsection.subTitle && <br />}
                    {subsubsection.subTitle}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {subsubsection.task}
                  </td>
                  <td
                    className={clsx(
                      compact ? "hidden" : "",
                      "py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                    )}
                  >
                    {formattedLength(subsubsection.lengthKm)}
                  </td>
                  <td
                    className={clsx(
                      compact ? "hidden" : "",
                      "py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                    )}
                  >
                    {formattedWidth(subsubsection.width)}
                  </td>
                  <td
                    className={clsx(
                      compact ? "hidden" : "",
                      "py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                    )}
                  >
                    {formattedEuro(subsubsection.costEstimate)}
                  </td>
                  <td
                    className={clsx(
                      compact ? "hidden" : "",
                      "py-4 pl-4 pr-3 text-sm font-medium text-gray-900",
                    )}
                  >
                    {subsubsection.qualityLevel?.title || "k.A."}
                  </td>
                  <td className={clsx(compact ? "hidden" : "", "break-words text-sm font-medium")}>
                    {mapillaryHref && (
                      <Link
                        href={mapillaryHref}
                        blank
                        // Trying to get the Link to fill the whole cell (only partial solution…)
                        className="py-4 pl-3 pr-4 sm:pr-6"
                        // This will prevent the <tr> onClick from firing. `pointer-events-none` does something differnet, it prevent this link from being clickable.
                        onClick={(e) => e.stopPropagation()}
                      >
                        Mapillary
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <SubsubsectionTableFooter subsubsections={subsubsections} compact={compact} />
        </table>
        {!subsubsections.length && (
          <div className="border-t px-3 py-5">
            <ZeroCase visible={subsubsections.length} name="Führungen" />
          </div>
        )}
      </TableWrapper>

      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={Routes.NewSubsubsectionPage({
            projectSlug: projectSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          Neue Führung
        </Link>
      </IfUserCanEdit>
    </section>
  )
}
