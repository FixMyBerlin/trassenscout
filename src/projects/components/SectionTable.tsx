import { Routes } from "@blitzjs/next"
import { Section } from "@prisma/client"
import { useRouter } from "next/router"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { SectionLabel } from "./Map/Labels"

type Props = {
  sections: Section[]
}

export const SectionTable: React.FC<Props> = ({ sections }) => {
  const router = useRouter()
  const { projectSlug } = useSlugs()

  if (!sections.length) return null

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
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Streckenlänge
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                Abstimmung
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
                    <SectionLabel label={`TS${section.index}`} />
                  </td>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-blue-500 group-hover:text-blue-800">
                    <strong>{section.title}</strong>: {section.subTitle}
                  </td>
                  <td className="break-words px-3 py-4 text-sm text-gray-500 ">
                    {section.length ? section.length + " km" : " k.A."}
                  </td>
                  <td className="break-words py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                    {/* TODO Abstimmung */}-
                    {/* <StakeholderSectionStatus stakeholdernotes={stakeholdernotes} /> */}
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
        href={Routes.NewSectionPage({ projectSlug: projectSlug! })}
      >
        Neue Teilstrecke
      </Link>
    </section>
  )
}
