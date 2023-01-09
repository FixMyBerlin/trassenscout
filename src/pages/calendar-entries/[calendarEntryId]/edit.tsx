import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import updateCalendarEntry from "src/calendar-entries/mutations/updateCalendarEntry"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import { Link } from "src/core/components/links"
import { CalendarEntrySchema, CalendarEntryType } from "src/calendar-entries/schema"

const EditCalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const [calendarEntry, { setQueryData }] = useQuery(
    getCalendarEntry,
    { id: calendarEntryId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateCalendarEntryMutation] = useMutation(updateCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateCalendarEntryMutation({
        id: calendarEntry.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowCalendarEntryPage({ calendarEntryId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  // Field Type `datetime-local` requires a format of "YYYY-MM-DDTHH:MM:SS" to pre fill the value.
  const calendarEntryForDateTimeField = {
    ...calendarEntry,
    ...{ startAt: calendarEntry.startAt.toISOString().split(".")[0] },
  }

  return (
    <>
      <MetaTags noindex title="Edit CalendarEntry {calendarEntry.id}" />

      <h1>Edit CalendarEntry {calendarEntry.id}</h1>
      <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>

      <CalendarEntryForm
        submitText="Update CalendarEntry"
        // TODO HILFE, siehe new.tsx
        schema={CalendarEntrySchema.omit({ startAt: true })}
        // TODO HILFE, `initialValues` ist vom Prisma Type CalendarEntry, ABER für das schema verwenden wir ZOD. Und startAt in Prisma ist vom Type "Date", aber in zod ist es vom Type "string".
        initialValues={calendarEntryForDateTimeField as unknown as CalendarEntryType}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditCalendarEntryPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditCalendarEntry />
      </Suspense>

      <p>
        <Link href={Routes.CalendarEntriesPage()}>Alle Kalendereinträge</Link>
      </p>
    </LayoutArticle>
  )
}

EditCalendarEntryPage.authenticate = true

export default EditCalendarEntryPage
