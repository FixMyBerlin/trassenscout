import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getCalendarEntries from "src/calendar-entries/queries/getCalendarEntries"
import { Link } from "src/core/components/links"
import { Calender } from "src/rs8/termine/components/Calender"
import { Pagination } from "src/core/components/Pagination"

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
      <Pagination
        visible={!hasMore || page !== 0}
        disablePrev={page === 0}
        disableNext={!hasMore}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </div>
  )
}

const CalendarEntriesPage = () => {
  return (
    <LayoutArticle>
      <MetaTags noindex title="Kalendereinträge" />

      <div>
        <p>
          <Link href={Routes.NewCalendarEntryPage()}>Neuer Kalendereintrag</Link>
        </p>

        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <CalendarEntriesList />
        </Suspense>
      </div>
    </LayoutArticle>
  )
}

export default CalendarEntriesPage
