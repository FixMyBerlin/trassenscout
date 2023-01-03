import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getDates from "src/dates/queries/getDates"
import { Link } from "src/core/components/links"

const ITEMS_PER_PAGE = 100

export const DatesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ dates, hasMore }] = usePaginatedQuery(getDates, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {dates.map((date) => (
          <li key={date.id}>
            <Link href={Routes.ShowDatePage({ dateId: date.id })}>
              <a>{date.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const DatesPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Dates" />

      <div>
        <p>
          <Link href={Routes.NewDatePage()}>Date erstellen</Link>
        </p>

        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <DatesList />
        </Suspense>
      </div>
    </LayoutArticle>
  )
}

export default DatesPage
