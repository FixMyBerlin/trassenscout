import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import deleteCalendarEntry from "src/calendar-entries/mutations/deleteCalendarEntry"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"
import { quote } from "src/core/components/text"
import { DateEntry } from "src/rs8/termine/components/Calender"

export const CalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const [deleteCalendarEntryMutation] = useMutation(deleteCalendarEntry)
  const [calendarEntry] = useQuery(getCalendarEntry, { id: calendarEntryId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${calendarEntry.id} unwiderruflich löschen?`)) {
      await deleteCalendarEntryMutation({ id: calendarEntry.id })
      await router.push(Routes.CalendarEntriesPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`"Kalender-Eintrag ${quote(calendarEntry.title)}"`} />

      <div>
        <h1>Kalender-Eintrag {quote(calendarEntry.title)}</h1>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>

        <div className="rounded border">
          <DateEntry calendarEntry={calendarEntry} />
        </div>

        <Link href={Routes.EditCalendarEntryPage({ calendarEntryId: calendarEntry.id })}>
          Bearbeiten
        </Link>

        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
      </div>
    </>
  )
}

const ShowCalendarEntryPage = () => {
  return (
    <LayoutArticle>
      <p>
        <Link href={Routes.CalendarEntriesPage()}>Alle Kalendereinträge</Link>
      </p>

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarEntry />
      </Suspense>
    </LayoutArticle>
  )
}

ShowCalendarEntryPage.authenticate = true

export default ShowCalendarEntryPage
