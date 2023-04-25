import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { Spinner } from "src/core/components/Spinner"
import getSubsubsections from "src/subsubsections/queries/getSubsubsections"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"

const ITEMS_PER_PAGE = 100

export const SubsubsectionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ subsubsections, hasMore }] = usePaginatedQuery(getSubsubsections, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Subsubsections</h1>

      <p>
        <Link href={Routes.NewSubsubsectionPage()}>Subsubsection erstellen</Link>
      </p>

      <ul>
        {subsubsections.map((subsubsection) => (
          <li key={subsubsection.id}>
            <Link href={Routes.ShowSubsubsectionPage({ subsubsectionId: subsubsection.id })}>
              {subsubsection.name}
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const SubsubsectionsPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Subsubsections" />

      <Suspense fallback={<Spinner page />}>
        <SubsubsectionsList />
      </Suspense>
    </LayoutArticle>
  )
}

export default SubsubsectionsPage
