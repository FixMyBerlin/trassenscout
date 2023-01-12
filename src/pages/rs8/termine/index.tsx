import { Suspense } from "react"
import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import getCalendarEntries from "src/calendar-entries/queries/getCalendarEntries"
import { Link } from "src/core/components/links"
import { Calender } from "src/rs8/termine/components/Calender"
import { Pagination } from "src/core/components/Pagination"
import { PageHeader } from "src/core/components/PageHeader"

const ITEMS_PER_PAGE = 100

const CalendarEntriesList = () => {
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
    <>
      <PageHeader
        title="Termine"
        description="Dieser Bereich hilft Ihnen dabei Termine zu finden."
        action={
          <Link button href={Routes.NewCalendarEntryPage()}>
            Neuer Kalendereintrag
          </Link>
        }
      />

      <Calender calendarEntries={calendarEntries} />
      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />
    </>
  )
}

const CalendarEntriesPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags noindex title="Kalendereinträge" />

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarEntriesList />
      </Suspense>
    </LayoutRs8>
  )
}

export default CalendarEntriesPage
