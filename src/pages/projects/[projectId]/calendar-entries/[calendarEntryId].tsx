import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import deleteCalendarEntry from "src/calendar-entries/mutations/deleteCalendarEntry"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import { PageHeader } from "src/core/components/PageHeader"
import { DateEntry } from "src/rs8/termine/components/Calender"

export const CalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const projectId = useParam("projectId", "number")
  const [deleteCalendarEntryMutation] = useMutation(deleteCalendarEntry)
  const [calendarEntry] = useQuery(getCalendarEntry, { id: calendarEntryId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${calendarEntry.id} unwiderruflich löschen?`)) {
      await deleteCalendarEntryMutation({ id: calendarEntry.id })
      await router.push(Routes.CalendarEntriesPage({ projectId: projectId! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`"Kalender-Eintrag ${quote(calendarEntry.title)}"`} />
      <PageHeader title={calendarEntry.title} />

      <p className="mb-10 space-x-4">
        <Link href={Routes.CalendarEntriesPage({ projectId: projectId! })}>Zurück zur Liste</Link>
        <span>–</span>
        <Link
          href={Routes.EditCalendarEntryPage({
            calendarEntryId: calendarEntry.id,
            projectId: projectId!,
          })}
        >
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

      <SuperAdminBox>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const ShowCalendarEntryPage: BlitzPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarEntry />
      </Suspense>

      <p>
        <Link href={Routes.CalendarEntriesPage({ projectId: projectId! })}>
          Alle CalendarEntries
        </Link>
      </p>
    </LayoutRs8>
  )
}

ShowCalendarEntryPage.authenticate = true

export default ShowCalendarEntryPage
