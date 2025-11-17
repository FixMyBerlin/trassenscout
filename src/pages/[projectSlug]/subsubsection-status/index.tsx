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
import deleteSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/deleteSubsubsectionStatus"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const SubsubsectionStatussWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsubsectionStatuss, hasMore }] = usePaginatedQuery(getSubsubsectionStatussWithCount, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteSubsubsectionStatusMutation] = useMutation(deleteSubsubsectionStatus)
  const handleDelete = async (subsubsectionStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsubsectionStatusMutation({ projectSlug, id: subsubsectionStatusId })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.SubsubsectionStatussPage({ projectSlug }))
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
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Kürzel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Titel
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Maßnahmen mit diesem Status
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
            {subsubsectionStatuss.map((status) => {
              return (
                <tr key={status.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <strong className="font-semibold">{shortTitle(status.slug)}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <strong className="font-semibold">{status.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {status.subsubsectionCount}{" "}
                    {status.subsubsectionCount > 1 ? "Maßnahmen" : "Maßnahme"}
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={Routes.EditSubsubsectionStatusPage({
                            projectSlug,
                            subsubsectionStatusId: status.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(status.id)}
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
          href={Routes.NewSubsubsectionStatusPage({ projectSlug })}
        >
          Neuer Status
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ subsubsectionStatuss }} />
    </>
  )
}

const SubsubsectionStatussPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Status" />
      <PageHeader title="Status" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <SubsubsectionStatussWithData />
      </Suspense>
    </LayoutRs>
  )
}

SubsubsectionStatussPage.authenticate = true

export default SubsubsectionStatussPage
