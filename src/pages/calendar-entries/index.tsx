import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getCalendarEntries from "src/calendar-entries/queries/getCalendarEntries"
import { Link } from "src/core/components/links"
import { Calender } from "src/rs8/termine/components/Calender"

const ITEMS_PER_PAGE = 100

export const CalendarEntriesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ calendarEntries, hasMore }] = usePaginatedQuery(getCalendarEntries, {
    orderBy: { startAt: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <Calender calendarEntries={calendarEntries} />
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const CalendarEntriesPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="CalendarEntries" />

      <div>
        <p>
          <Link href={Routes.NewCalendarEntryPage()}>CalendarEntry erstellen</Link>
        </p>

        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <CalendarEntriesList />
        </Suspense>
      </div>
    </LayoutArticle>
  )
}

export default CalendarEntriesPage
