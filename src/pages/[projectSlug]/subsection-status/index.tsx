import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { Spinner } from "@/src/core/components/Spinner"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { Link, linkIcons, linkStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { quote, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import deleteSubsectionStatus from "@/src/server/subsectionStatus/mutations/deleteSubsectionStatus"
import getSubsectionStatussWithCount from "@/src/server/subsectionStatus/queries/getSubsectionStatussWithCount"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const SubsectionStatussWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsectionStatuss, hasMore }] = usePaginatedQuery(getSubsectionStatussWithCount, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteSubsectionStatusMutation] = useMutation(deleteSubsectionStatus)
  const handleDelete = async (subsectionStatusId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsectionStatusId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsectionStatusMutation({ projectSlug, id: subsectionStatusId })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.SubsectionStatussPage({ projectSlug }))
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
                Darstellung
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Anzahl Planungsabschnitte mit diesem Status
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
            {subsectionStatuss.map((status) => {
              return (
                <tr key={status.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <strong className="font-semibold">{shortTitle(status.slug)}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <strong className="font-semibold">{status.title}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        status.style === "REGULAR"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                      )}
                    >
                      {status.style === "REGULAR" ? "Durchgezogen" : "Gestrichelt"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {status.subsectionCount} Planungsabschnitte mit dem Status {quote(status.title)}
                  </td>
                  <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={Routes.EditSubsectionStatusPage({
                            projectSlug,
                            subsectionStatusId: status.id,
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
          href={Routes.NewSubsectionStatusPage({ projectSlug })}
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

      <SuperAdminLogData data={{ subsectionStatuss }} />
    </>
  )
}

const SubsectionStatussPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Status" />
      <PageHeader title="Status" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <SubsectionStatussWithData />
      </Suspense>
    </LayoutRs>
  )
}

SubsectionStatussPage.authenticate = true

export default SubsectionStatussPage
