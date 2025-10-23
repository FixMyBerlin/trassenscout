import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { Spinner } from "@/src/core/components/Spinner"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import deleteSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/deleteSubsubsectionSpecial"
import getSubsubsectionSpecialsWithCount from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecialsWithCount"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const SubsubsectionSpecialsWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsubsectionSpecials, hasMore }] = usePaginatedQuery(
    getSubsubsectionSpecialsWithCount,
    {
      projectSlug,
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    },
  )

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteSubsubsectionSpecialMutation] = useMutation(deleteSubsubsectionSpecial)
  const handleDelete = async (subsubsectionSpecialId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionSpecialId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsubsectionSpecialMutation({ projectSlug, id: subsubsectionSpecialId })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.SubsubsectionSpecialsPage({ projectSlug }))
    }
  }

  return (
    <>
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Kurz-Titel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Titel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Einträge mit dieser Besonderheit
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-right text-sm font-semibold text-gray-900 sm:pr-6"
              >
                <span className="sr-only">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsectionSpecials.map((Special) => {
              return (
                <tr key={Special.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <strong className="font-semibold">{shortTitle(Special.slug)}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <strong className="font-semibold">{Special.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {Special.subsubsectionCount}{" "}
                    {Special.subsubsectionCount > 1 ? "Einträge" : "Eintrag"}
                  </td>
                  <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={Routes.EditSubsubsectionSpecialPage({
                            projectSlug,
                            subsubsectionSpecialId: Special.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(Special.id)}
                          className={clsx(
                            linkStyles,
                            "inline-flex items-center justify-center gap-1",
                          )}
                        >
                          {linkIcons["delete"]}
                          Löschen
                        </button>
                      </ButtonWrapper>
                    </IfUserCanEdit>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </TableWrapper>

      <IfUserCanEdit>
        <Link
          button="blue"
          icon="plus"
          className="mt-4"
          href={Routes.NewSubsubsectionSpecialPage({ projectSlug })}
        >
          Neue Besonderheit
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ subsubsectionSpecials }} />
    </>
  )
}

const SubsubsectionSpecialsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Besonderheiten" />
      <PageHeader title="Besonderheiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <SubsubsectionSpecialsWithData />
      </Suspense>
    </LayoutRs>
  )
}

SubsubsectionSpecialsPage.authenticate = true

export default SubsubsectionSpecialsPage
