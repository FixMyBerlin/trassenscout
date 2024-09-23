import { DateEntry } from "@/src/calendar-entries/components/Calender"
import deleteCalendarEntry from "@/src/calendar-entries/mutations/deleteCalendarEntry"
import getCalendarEntry from "@/src/calendar-entries/queries/getCalendarEntry"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, linkStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { quote } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const CalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const projectSlug = useProjectSlug()
  const [deleteCalendarEntryMutation] = useMutation(deleteCalendarEntry)
  const [calendarEntry] = useQuery(getCalendarEntry, { projectSlug, id: calendarEntryId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${calendarEntry.id} unwiderruflich löschen?`)) {
      await deleteCalendarEntryMutation({ projectSlug, id: calendarEntry.id })
      await router.push(Routes.CalendarEntriesPage({ projectSlug }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Termin ${quote(calendarEntry.title)}`} />
      <PageHeader title={`Termin ${quote(calendarEntry.title)}`} className="mt-12" />

      <IfUserCanEdit>
        <p className="mb-10 space-x-4">
          <Link
            href={Routes.EditCalendarEntryPage({
              calendarEntryId: calendarEntry.id,
              projectSlug,
            })}
          >
            Eintrag bearbeiten
          </Link>
          <span>–</span>
          <button type="button" onClick={handleDelete} className={linkStyles}>
            Eintrag löschen
          </button>
        </p>
      </IfUserCanEdit>

      <div className="max-w-prose rounded border shadow">
        <DateEntry withAction={false} calendarEntry={calendarEntry} />
      </div>

      <SuperAdminBox>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.CalendarEntriesPage({ projectSlug })}>Zurück Terminen</Link>
    </>
  )
}

const ShowCalendarEntryPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <CalendarEntry />
      </Suspense>
    </LayoutRs>
  )
}

ShowCalendarEntryPage.authenticate = true

export default ShowCalendarEntryPage
