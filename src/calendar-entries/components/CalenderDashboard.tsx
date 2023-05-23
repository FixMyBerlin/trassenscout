import { Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { startOfDay } from "date-fns"
import { Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { Spinner } from "src/core/components/Spinner"
import { H2 } from "src/core/components/text/Headings"
import { DateList } from "../../rs8/termine/components/Calender/DateList"
import getCalendarEntries from "../queries/getCalendarEntries"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"

const CalendarDashboardDateList: React.FC = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [{ calendarEntries }] = usePaginatedQuery(getCalendarEntries, {
    projectSlug: projectSlug!,
    orderBy: { startAt: "asc" },
    take: 3,
    where: {
      startAt: {
        gte: startOfDay(new Date()),
      },
    },
  })

  return (
    <>
      <DateList calendarEntries={calendarEntries} />
      <div className="mt-5">
        {Boolean(calendarEntries.length) ? (
          <Link button="white" href={Routes.CalendarEntriesPage({ projectSlug: projectSlug! })}>
            Alle Termine
          </Link>
        ) : (
          <Link icon="plus" href={Routes.NewCalendarEntryPage({ projectSlug: projectSlug! })}>
            Neuen Termin eintragen
          </Link>
        )}
      </div>
    </>
  )
}

export const CalenderDashboard: React.FC = () => {
  return (
    <section className="mt-12">
      <H2 className="mb-3">Kommende Termine</H2>
      <Suspense fallback={<Spinner />}>
        <CalendarDashboardDateList />
      </Suspense>
    </section>
  )
}
