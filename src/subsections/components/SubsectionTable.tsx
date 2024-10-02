import { SubsectionIcon } from "@/src/core/components/Map/Icons"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link } from "@/src/core/components/links"
import { longTitle, shortTitle } from "@/src/core/components/text"
import { startEnd } from "@/src/core/components/text/startEnd"
import { useProjectSlug, useSlugs } from "@/src/core/hooks"
import { StakeholderSummary } from "@/src/stakeholdernotes/components/StakeholderSummary"
import { Routes } from "@blitzjs/next"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { IfUserCanEdit } from "../../memberships/components/IfUserCan"
import { SubsectionWithPosition } from "../queries/getSubsection"

type Props = {
  subsections: SubsectionWithPosition[]
  createButton?: boolean
}

export const SubsectionTable: React.FC<Props> = ({ subsections, createButton = true }) => {
  const router = useRouter()
  const { subsectionSlug } = useSlugs()
  const projectSlug = useProjectSlug()

  return (
    <section>
      <TableWrapper className="mt-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                colSpan={2}
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Planungsabschnitt
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Baulastträger
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Führungen
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                TÖBs
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
                  className="group cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(route)}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <SubsectionIcon label={shortTitle(subsection.slug)} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <strong>{longTitle(subsection.slug)}</strong>
                    <br />
                    {startEnd(subsection)}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 group-hover:bg-gray-50">
                    {subsection.operator?.title || "–"}{" "}
                    {subsection.operator?.slug && (
                      <span className="uppercase">({subsection.operator?.slug})</span>
                    )}
                  </td>
                  <td
                    className={clsx(
                      "py-4 pl-4 pr-3 text-sm font-medium group-hover:bg-gray-50",
                      subsection.subsubsectionCount === 0
                        ? "text-gray-300 group-hover:text-gray-500"
                        : "text-gray-900",
                    )}
                  >
                    {subsection.subsubsectionCount}
                  </td>
                  <td className="break-words py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                    <StakeholderSummary
                      format="number"
                      stakeholdernotesCounts={subsection.stakeholdernotesCounts}
                    />
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

      {createButton && (
        <IfUserCanEdit>
          <Link
            button="blue"
            icon="plus"
            className="mt-4"
            href={Routes.NewSubsectionPage({
              projectSlug: projectSlug!,
              subsectionSlug: subsectionSlug!,
            })}
          >
            Neuer Planungsabschnitt
          </Link>
        </IfUserCanEdit>
      )}
    </section>
  )
}
