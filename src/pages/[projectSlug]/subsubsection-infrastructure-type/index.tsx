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
import deleteSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/deleteSubsubsectionInfrastructureType"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const SubsubsectionInfrastructureTypesWithData = () => {
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsubsectionInfrastructureTypes, hasMore }] = usePaginatedQuery(
    getSubsubsectionInfrastructureTypesWithCount,
    {
      projectSlug,
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    },
  )

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteSubsubsectionInfrastructureTypeMutation] = useMutation(
    deleteSubsubsectionInfrastructureType,
  )
  const handleDelete = async (subsubsectionInfrastructureTypeId: number) => {
    if (
      window.confirm(
        `Den Eintrag mit ID ${subsubsectionInfrastructureTypeId} unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteSubsubsectionInfrastructureTypeMutation({
          projectSlug,
          id: subsubsectionInfrastructureTypeId,
        })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.SubsubsectionInfrastructureTypesPage({ projectSlug }))
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
                Fördergegenstand
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Slug
              </th>
              <th
                scope="col"
                className="sr-only px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-6"
              >
                bearbeiten
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subsubsectionInfrastructureTypes.map((infrastructureType) => {
              return (
                <tr key={infrastructureType.id}>
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                    {infrastructureType.title}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(infrastructureType.slug)}
                      className="text-left font-mono text-xs"
                    >
                      {shortTitle(infrastructureType.slug)}
                    </button>
                  </td>
                  <td className="py-4 text-sm font-medium whitespace-nowrap sm:pr-6">
                    <IfUserCanEdit>
                      <ButtonWrapper className="justify-end">
                        <Link
                          icon="edit"
                          href={Routes.EditSubsubsectionInfrastructureTypePage({
                            projectSlug,
                            subsubsectionInfrastructureTypeId: infrastructureType.id,
                          })}
                        >
                          Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(infrastructureType.id)}
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
          href={Routes.NewSubsubsectionInfrastructureTypePage({ projectSlug })}
        >
          Neuer Fördergegenstand
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ subsubsectionInfrastructureTypes }} />
    </>
  )
}

const SubsubsectionInfrastructureTypesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Fördergegenstand" />
      <PageHeader title="Fördergegenstand" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <SubsubsectionInfrastructureTypesWithData />
      </Suspense>
    </LayoutRs>
  )
}

SubsubsectionInfrastructureTypesPage.authenticate = true

export default SubsubsectionInfrastructureTypesPage
