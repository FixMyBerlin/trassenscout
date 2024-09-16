import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link, linkIcons, linkStyles } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { TableWrapper } from "src/core/components/Table/TableWrapper"
import { shortTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { IfUserCanEdit } from "src/memberships/components/IfUserCan"
import deleteQualityLevel from "src/qualityLevels/mutations/deleteQualityLevel"
import getQualityLevelsWithCount from "src/qualityLevels/queries/getQualityLevelsWithCount"

const ITEMS_PER_PAGE = 100

export const QualityLevelsWithData = () => {
  const projectSlug = useParam("projectSlug", "string")
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ qualityLevels, hasMore }] = usePaginatedQuery(getQualityLevelsWithCount, {
    projectSlug: projectSlug!,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const [deleteQualityLevelMutation] = useMutation(deleteQualityLevel)
  const handleDelete = async (qualityLevelId: number) => {
    if (window.confirm(`Den Eintrag mit ID ${qualityLevelId} unwiderruflich löschen?`)) {
      await deleteQualityLevelMutation({ id: qualityLevelId })
      await router.push(Routes.QualityLevelsPage({ projectSlug: projectSlug! }))
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
                Anzahl der Führungen
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
            {qualityLevels.map((qualityLevel) => {
              return (
                <tr key={qualityLevel.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <strong className="font-semibold">{shortTitle(qualityLevel.slug)}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <strong className="font-semibold">{qualityLevel.title}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {qualityLevel.subsubsectionCount} Führungen
                  </td>
                  <td className="whitespace-nowrap py-4 text-sm font-medium sm:pr-6">
                    <ButtonWrapper className="justify-end">
                      <Link
                        icon="edit"
                        href={Routes.QualityLevelsPage({
                          projectSlug: projectSlug!,
                          qualityLevelId: qualityLevel.id,
                        })}
                      >
                        Bearbeiten
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(qualityLevel.id)}
                        className={clsx(
                          linkStyles,
                          "inline-flex items-center justify-center gap-1",
                        )}
                      >
                        {linkIcons["delete"]}
                        Löschen
                      </button>
                    </ButtonWrapper>
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
          href={Routes.NewQualityLevelPage({ projectSlug: projectSlug! })}
        >
          Neuer Ausbaustandard
        </Link>
      </IfUserCanEdit>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={{ qualityLevels }} />
    </>
  )
}

const QualityLevelsPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Ausbaustandards" />
      <PageHeader title="Ausbaustandards" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <QualityLevelsWithData />
      </Suspense>
    </LayoutRs>
  )
}

QualityLevelsPage.authenticate = true

export default QualityLevelsPage
