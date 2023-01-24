import { Suspense } from "react"
import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"
import { Link } from "src/core/components/links"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"

const ITEMS_PER_PAGE = 100

export const StakeholdernotesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ stakeholdernotes, hasMore }] = usePaginatedQuery(getStakeholdernotes, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <h1>Stakeholdernotes</h1>

      <ul>
        {stakeholdernotes.map((stakeholdernote) => (
          <li key={stakeholdernote.id}>
            <Link href={Routes.ShowStakeholdernotePage({ stakeholdernoteId: stakeholdernote.id })}>
              {stakeholdernote.title}
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

const StakeholdernotesPage: BlitzPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Stakeholdernotes" />

      <Suspense fallback={<Spinner page />}>
        <StakeholdernotesList />
      </Suspense>
    </LayoutArticle>
  )
}

export default StakeholdernotesPage
