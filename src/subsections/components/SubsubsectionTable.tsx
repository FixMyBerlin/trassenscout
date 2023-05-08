import { Routes } from "@blitzjs/next"
import clsx from "clsx"
import { useRouter } from "next/router"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { Subsubsection } from "src/pages/[projectSlug]/[sectionSlug]/[...subsectionPath]"
import { SubsubsectionMarker } from "src/projects/components/Map/Markers"

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
                Streckenlänge
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Breite
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
                  className={clsx("group cursor-pointer", {
                    "bg-blue-50": subsubsection.slug === subsubsectionSlug,
                  })}
                  onClick={() => router.push(route, undefined, { scroll: false })}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 group-hover:bg-gray-50 sm:pl-6">
                    <SubsubsectionMarker label={`RF${index + 1}`} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 decoration-gray-500 decoration-1 underline-offset-4 group-hover:bg-gray-50 group-hover:underline">
                    <strong>{subsubsection.title}</strong>
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 decoration-gray-500 decoration-1 underline-offset-4 group-hover:bg-gray-50 group-hover:underline">
                    {subsubsection.length ? subsubsection.length + " km" : " k.A."}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 decoration-gray-500 decoration-1 underline-offset-4 group-hover:bg-gray-50 group-hover:underline">
                    {subsubsection.width ? subsubsection.width + " m" : " k.A."}
                  </td>
                  <td className="break-words py-4 pl-3 pr-4 text-sm font-medium group-hover:bg-gray-50 sm:pr-6">
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
