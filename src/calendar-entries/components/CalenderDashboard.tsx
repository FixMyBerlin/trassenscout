import { Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { startOfDay } from "date-fns"
import { Suspense } from "react"
import { Link } from "src/core/components/links/Link"
import { Spinner } from "src/core/components/Spinner"
import { H2 } from "src/core/components/text/Headings"
import getProject from "src/projects/queries/getProject"
import { DateList } from "../../rs8/termine/components/Calender/DateList"
import getCalendarEntries from "../queries/getCalendarEntries"

const CalendarDashboardDateList: React.FC = () => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })
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

  if (!calendarEntries.length)
    return (
      <Link href={Routes.NewCalendarEntryPage({ projectSlug: projectSlug! })}>
        Neuen Termin eintragen
      </Link>
    )

  return (
    <>
      <DateList calendarEntries={calendarEntries} />
      {Boolean(calendarEntries.length) && (
        <p>
          <Link button href={Routes.CalendarEntriesPage({ projectSlug: projectSlug! })}>
            Alle Termine
          </Link>
        </p>
      )}
    </>
  )
}

export const CalenderDashboard: React.FC = () => {
  return (
    <section className="my-12 space-y-6 md:max-w-prose">
      <H2>Kommende Termine</H2>
      <Suspense fallback={<Spinner />}>
        <CalendarDashboardDateList />
      </Suspense>
    </section>
  )
}
