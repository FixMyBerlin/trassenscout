import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links/Link"
import { H2 } from "@/src/core/components/text/Headings"
import { useProjectSlug } from "@/src/core/hooks"
import { Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { startOfDay } from "date-fns"
import { Suspense } from "react"
import { IfUserCanEdit } from "../../memberships/components/IfUserCan"
import getCalendarEntries from "../queries/getCalendarEntries"
import { DateList } from "./Calender/DateList"

const CalendarDashboardDateList: React.FC = () => {
  const projectSlug = useProjectSlug()
  const [{ calendarEntries }] = usePaginatedQuery(getCalendarEntries, {
    projectSlug,
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
          <IfUserCanEdit>
            <Link icon="plus" href={Routes.NewCalendarEntryPage({ projectSlug: projectSlug! })}>
              Neuen Termin eintragen
            </Link>
          </IfUserCanEdit>
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
