import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import getCalendarEntries from "src/calendar-entries/queries/getCalendarEntries"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { Calender } from "src/rs8/termine/components/Calender"

const ITEMS_PER_PAGE = 100

export const CalendarEntriesWithData = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
  const [{ calendarEntries, hasMore }] = usePaginatedQuery(getCalendarEntries, {
    projectSlug: projectSlug!,
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <Calender calendarEntries={calendarEntries} />

      <ButtonWrapper className="mt-5">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewCalendarEntryPage({ projectSlug: projectSlug! })}
        >
          Termin
        </Link>
      </ButtonWrapper>

      <Pagination
        hasMore={hasMore}
        page={page}
        handlePrev={goToPreviousPage}
        handleNext={goToNextPage}
      />

      <SuperAdminLogData data={calendarEntries} />
    </>
  )
}

const CalendarEntriesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Termine" />
      <PageHeader
        title="Termine"
        description="Dieser Bereich hilft Ihnen Termine zu verwalten."
        className="mt-12"
      />

      <Suspense fallback={<Spinner page />}>
        <CalendarEntriesWithData />
      </Suspense>
    </LayoutRs>
  )
}

export default CalendarEntriesPage
