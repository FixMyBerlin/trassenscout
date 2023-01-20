import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import getCalendarEntries from "src/calendar-entries/queries/getCalendarEntries"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { Calender } from "src/rs8/termine/components/Calender"

const ITEMS_PER_PAGE = 100

export const CalendarEntriesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
  const [{ calendarEntries, hasMore }] = usePaginatedQuery(getCalendarEntries, {
    where: { project: { slug: projectSlug! } },
    orderBy: { id: "asc" },
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
          <Link button href={Routes.NewCalendarEntryPage({ projectSlug: projectSlug! })}>
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
    <LayoutRs>
      <MetaTags noindex title="Kalendereinträge" />

      <Suspense fallback={<Spinner page />}>
        <CalendarEntriesList />
      </Suspense>
    </LayoutRs>
  )
}

export default CalendarEntriesPage
