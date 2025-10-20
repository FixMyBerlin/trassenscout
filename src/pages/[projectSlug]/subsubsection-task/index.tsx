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
import deleteSubsubsectionTask from "@/src/server/subsubsectionTask/mutations/deleteSubsubsectionTask"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const SubsubsectionTasksWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsubsectionTasks, hasMore }] = usePaginatedQuery(getSubsubsectionTasksWithCount, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteSubsubsectionTaskMutation] = useMutation(deleteSubsubsectionTask)
  const handleDelete = async (subsubsectionTaskId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsectionTaskId} unwiderruflich löschen?`)) {
      try {
        await deleteSubsubsectionTaskMutation({ projectSlug, id: subsubsectionTaskId })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.SubsubsectionTasksPage({ projectSlug }))
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
                Anzahl Einträge mit <br />
                diesem Eintragstyp
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
            {subsubsectionTasks.map((Task) => {
              return (
                <tr key={Task.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <strong className="font-semibold">{shortTitle(Task.slug)}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <strong className="font-semibold">{Task.title}</strong>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {Task.subsubsectionCount} {Task.subsubsectionCount > 1 ? "Einträge" : "Eintrag"}
                  </td>
                  <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={Routes.EditSubsubsectionTaskPage({
                            projectSlug,
                            subsubsectionTaskId: Task.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(Task.id)}
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
          href={Routes.NewSubsubsectionTaskPage({ projectSlug })}
        >
          Neuer Eintragstyp
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ subsubsectionTasks }} />
    </>
  )
}

const SubsubsectionTasksPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Eintragstypen" />
      <PageHeader title="Eintragstypen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <SubsubsectionTasksWithData />
      </Suspense>
    </LayoutRs>
  )
}

SubsubsectionTasksPage.authenticate = true

export default SubsubsectionTasksPage
