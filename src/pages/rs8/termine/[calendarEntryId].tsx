import { Suspense } from "react"
import { BlitzPage, Routes as PageRoutes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import deleteCalendarEntry from "src/calendar-entries/mutations/deleteCalendarEntry"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"
import { quote } from "src/core/components/text"
import { DateEntry } from "src/rs8/termine/components/Calender"
import { AdminBox } from "src/core/components/AdminBox"
import { PageHeader } from "src/core/components/PageHeader"

export const CalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const [deleteCalendarEntryMutation] = useMutation(deleteCalendarEntry)
  const [calendarEntry] = useQuery(getCalendarEntry, { id: calendarEntryId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${calendarEntry.id} unwiderruflich löschen?`)) {
      await deleteCalendarEntryMutation({ id: calendarEntry.id })
      await router.push(PageRoutes.CalendarEntriesPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`"Kalender-Eintrag ${quote(calendarEntry.title)}"`} />
      <PageHeader title={calendarEntry.title} />

      <p className="mb-10 space-x-4">
        <Link href={PageRoutes.CalendarEntriesPage()}>Zurück zur Liste</Link>
        <span>–</span>
        <Link href={PageRoutes.EditCalendarEntryPage({ calendarEntryId: calendarEntry.id })}>
          Eintrag bearbeiten
        </Link>
        <span>–</span>
        <button type="button" onClick={handleDelete} className={linkStyles}>
          Eintrag löschen
        </button>
      </p>

      <div className="max-w-prose rounded border shadow">
        <DateEntry calendarEntry={calendarEntry} />
      </div>

      <AdminBox>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>
      </AdminBox>
    </>
  )
}

const ShowCalendarEntryPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarEntry />
      </Suspense>
    </LayoutRs8>
  )
}

ShowCalendarEntryPage.authenticate = true

export default ShowCalendarEntryPage
