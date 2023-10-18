import { Routes } from "@blitzjs/next"
import clsx from "clsx"
import { useRouter } from "next/router"
import { SubsectionIcon } from "src/core/components/Map/Icons"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { longTitle, shortTitle } from "src/core/components/text"
import { startEnd } from "src/core/components/text/startEnd"
import { useSlugs } from "src/core/hooks"
import { StakeholderSummary } from "src/stakeholdernotes/components/StakeholderSummary"
import { SubsectionWithPosition } from "../queries/getSubsection"
import { lineString } from "@turf/helpers"
import { ClipboardDocumentIcon } from "@heroicons/react/20/solid"
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline"

type Props = {
  subsections: SubsectionWithPosition[]
  createButton?: boolean
}

export const SubsectionTableAdmin: React.FC<Props> = ({ subsections }) => {
  const router = useRouter()
  const { projectSlug, subsectionSlug } = useSlugs()
  const handleSlugCopyClick = async (slug: string) => {
    await navigator.clipboard.writeText(slug)
  }

  return (
    <section>
      <TableWrapper className="mt-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Planungsabschnitt
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Slug
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Nummer (order)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Start
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Ende
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Geometrie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsections.map((subsection) => {
              const route = Routes.SubsectionDashboardPage({
                projectSlug: projectSlug!,
                subsectionSlug: subsection.slug,
              })
              return (
                <tr
                  key={subsection.id}
                  className="group cursor-pointer hover:bg-gray-50 h-full"
                  // onClick={() => router.push(route)}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900  sm:pl-6">
                    <SubsectionIcon label={shortTitle(subsection.slug)} />
                  </td>

                  <td className=" py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <div className="flex gap-5">
                      <p>{subsection.slug}</p>
                      <button onClick={() => handleSlugCopyClick(subsection.slug)}>
                        <ClipboardDocumentListIcon className="w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                    {subsection.order}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pl-4 pr-3 text-sm font-medium group-hover:bg-gray-50",
                      subsection.end === "unbekannt"
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {subsection.start}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pl-4 pr-3 text-sm font-medium group-hover:bg-gray-50",
                      subsection.end === "unbekannt"
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {subsection.end}
                  </td>

                  <td
                    className={clsx(
                      "py-4 pl-4 pr-3 text-sm font-medium group-hover:bg-gray-50",
                      String(subsection.geometry) ===
                        "5.98865807458,47.3024876979,15.0169958839,54.983104153"
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {String(subsection.geometry) !==
                    "5.98865807458,47.3024876979,15.0169958839,54.983104153" ? (
                      <Link
                        blank
                        href={`http://geojson.io/#data=data:application/json,${encodeURIComponent(
                          JSON.stringify(lineString(subsection.geometry)),
                        )}`}
                      >
                        Auf geojson.io öffnen
                      </Link>
                    ) : (
                      "Nein"
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!subsections.length && (
          <div className="border-t px-3 py-5 text-center text-gray-500">
            Noch keine Planungsabschnitte angelegt
          </div>
        )}
      </TableWrapper>
    </section>
  )
}
