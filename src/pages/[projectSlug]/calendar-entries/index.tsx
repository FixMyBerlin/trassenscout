import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Pagination } from "@/src/core/components/Pagination"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { Calender } from "@/src/pagesComponents/calendar-entries/Calender"
import getCalendarEntries from "@/src/server/calendar-entries/queries/getCalendarEntries"
import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const ITEMS_PER_PAGE = 100

export const CalendarEntriesWithData = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useProjectSlug()
  const [{ calendarEntries, hasMore }] = usePaginatedQuery(getCalendarEntries, {
    projectSlug,
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <>
      <Calender calendarEntries={calendarEntries} />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-5">
          <Link button="blue" icon="plus" href={Routes.NewCalendarEntryPage({ projectSlug })}>
            Termin
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>

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

CalendarEntriesPage.authenticate = true

export default CalendarEntriesPage
