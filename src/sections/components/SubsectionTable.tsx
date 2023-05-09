import { Routes } from "@blitzjs/next"
import { Subsection } from "@prisma/client"
import { useRouter } from "next/router"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { SubsectionLabel } from "src/projects/components/Map/Labels"

type Props = {
  subsections: Subsection[]
}

export const SubsectionTable: React.FC<Props> = ({ subsections }) => {
  const router = useRouter()
  const { projectSlug, sectionSlug } = useSlugs()

  if (!subsections.length) return null

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
              {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Streckenlänge
              </th> */}
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                -
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsections.map((subsection, index) => {
              const route = Routes.SubsectionDashboardPage({
                projectSlug: projectSlug!,
                sectionSlug: sectionSlug!,
                subsectionPath: [subsection.slug],
              })
              return (
                <tr
                  key={subsection.id}
                  className="group cursor-pointer"
                  onClick={() => router.push(route)}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 group-hover:bg-gray-50 sm:pl-6">
                    <SubsectionLabel label={`PA${index + 1}`} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 decoration-gray-500 decoration-1 underline-offset-4 group-hover:bg-gray-50 group-hover:underline">
                    <strong>{subsection.title}</strong>
                  </td>
                  {/* <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 decoration-gray-500 decoration-1 underline-offset-4 group-hover:bg-gray-50 group-hover:underline">
                    <strong>{subsection.title}</strong>
                  </td> */}
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
        href={Routes.NewSubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
        })}
      >
        Neuer Planungsabschnitt
      </Link>
    </section>
  )
}
