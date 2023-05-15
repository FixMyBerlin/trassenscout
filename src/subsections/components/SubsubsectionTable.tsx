import { Routes } from "@blitzjs/next"
import { Subsubsection } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { formattedEuro, formattedLength, formattedWidth } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { SubsubsectionIcon } from "src/core/components/Map/Icons"

type Props = {
  subsubsections: Subsubsection[]
}

export const SubsubsectionTable: React.FC<Props> = ({ subsubsections }) => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  if (!subsubsections.length) return null

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
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Länge
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Breite
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Kostenschätzung
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                -
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsections.map((subsubsection, index) => {
              const route = Routes.SubsectionDashboardPage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
                subsectionPath: [subsectionSlug!, subsubsection.slug],
              })

              return (
                <tr
                  key={subsubsection.id}
                  className={clsx(
                    subsubsection.slug === subsubsectionSlug
                      ? "bg-blue-50"
                      : "group cursor-pointer hover:bg-gray-50"
                  )}
                  onClick={() => router.push(route, undefined, { scroll: false })}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <SubsubsectionIcon
                      label={subsubsection.type === "ROUTE" ? `RF${index + 1}` : `SF${index + 1}`}
                    />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <strong>{subsubsection.title}</strong>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {subsubsection.task}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {formattedLength(subsubsection.length)}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {formattedWidth(subsubsection.width)}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {formattedEuro(subsubsection.costEstimate)}
                  </td>
                  <td className="break-words py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                    {/* TODO Abstimmung */}-
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrapper>
      <Link
        button="blue"
        icon="plus"
        className="mt-4"
        href={Routes.NewSubsubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: subsectionSlug!,
        })}
      >
        Neue Führung
      </Link>
    </section>
  )
}
