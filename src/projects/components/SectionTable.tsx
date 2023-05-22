import { Routes } from "@blitzjs/next"
import { Section } from "@prisma/client"
import { useRouter } from "next/router"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { SectionIcon } from "../../core/components/Map/Icons"
import { startEnd } from "src/core/components/text/startEnd"
import { formattedLength, longTitle } from "src/core/components/text"

type Props = {
  sections: Section[]
}

export const SectionTable: React.FC<Props> = ({ sections }) => {
  const router = useRouter()
  const { projectSlug } = useSlugs()

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
                Teilstrecke
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sections.map((section) => {
              const route = Routes.SectionDashboardPage({
                projectSlug: projectSlug!,
                sectionSlug: section.slug,
              })
              return (
                <tr
                  key={section.id}
                  className="group cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(route)}
                >
                  <td className="h-20 w-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <SectionIcon label={section.slug} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <strong>{longTitle(section.slug)}</strong>
                    <br />
                    {startEnd(section)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!sections.length && (
          <div className="border-t px-3 py-5 text-center text-gray-500">
            Noch keine Teilstrecken angelegt
          </div>
        )}
      </TableWrapper>
      <Link
        button="blue"
        icon="plus"
        className="mt-4"
        href={Routes.NewSectionPage({ projectSlug: projectSlug! })}
      >
        Neue Teilstrecke
      </Link>
    </section>
  )
}
