import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, LayoutRs, MetaTags } from "src/core/layouts"
import deleteCalendarEntry from "src/calendar-entries/mutations/deleteCalendarEntry"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import { PageHeader } from "src/core/components/PageHeader"
import { DateEntry } from "src/rs8/termine/components/Calender"

export const CalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const projectSlug = useParam("projectSlug", "string")
  const [deleteCalendarEntryMutation] = useMutation(deleteCalendarEntry)
  const [calendarEntry] = useQuery(getCalendarEntry, { id: calendarEntryId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${calendarEntry.id} unwiderruflich löschen?`)) {
      await deleteCalendarEntryMutation({ id: calendarEntry.id })
      await router.push(Routes.CalendarEntriesPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Termin ${quote(calendarEntry.title)}`} />
      <PageHeader title={`Termin ${quote(calendarEntry.title)}`} />
      <p className="mb-10 space-x-4">
        <Link
          href={Routes.EditCalendarEntryPage({
            calendarEntryId: calendarEntry.id,
            projectSlug: projectSlug!,
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

      <Link href={Routes.CalendarEntriesPage({ projectSlug: projectSlug! })}>
        Zurück zum Kalender
      </Link>
    </>
  )
}

const ShowCalendarEntryPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <CalendarEntry />
      </Suspense>
    </LayoutRs>
  )
}

ShowCalendarEntryPage.authenticate = true

export default ShowCalendarEntryPage
