import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import updateCalendarEntry from "src/calendar-entries/mutations/updateCalendarEntry"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import {
  CalendarEntrySchema,
  CalendarEntryStartDateStartTimeSchema,
} from "src/calendar-entries/schema"
import { getDate, getTime } from "src/calendar-entries/utils/splitStartAt"
import { transformValuesWithStartAt } from "src/calendar-entries/utils/transformValuesWithStartAt"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { z } from "zod"

const EditCalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const projectSlug = useParam("projectSlug", "string")
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
      const transformedValues = transformValuesWithStartAt(values)
      const updated = await updateCalendarEntryMutation({
        ...transformedValues,
        id: calendarEntry.id,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectSlug: projectSlug!,
          calendarEntryId: updated.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const Schema = CalendarEntrySchema.omit({ startAt: true }).merge(
    CalendarEntryStartDateStartTimeSchema
  )
  type InitialValue = z.infer<typeof Schema>

  // We cannot edit startAt directly, so we need to split the startDate and startTime
  // and format them correctly for the given input types.
  const createInitialValues = () => {
    const copy: any = structuredClone(calendarEntry)
    copy.startDate = getDate(copy.startAt)
    copy.startTime = getTime(copy.startAt)
    delete copy["startAt"]
    return copy as InitialValue
  }

  return (
    <>
      <MetaTags noindex title={`Termin ${quote(calendarEntry.title)}`} />

      <PageHeader title={quote(calendarEntry.title)} subtitle="Termin bearbeiten" />

      <CalendarEntryForm
        submitText="Speichern"
        schema={Schema}
        initialValues={createInitialValues()}
        onSubmit={handleSubmit}
      />

      <SuperAdminBox>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const EditCalendarEntryPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditCalendarEntry />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage({ projectSlug: projectSlug! })}>
          Zurück zur Liste
        </Link>
      </p>
    </LayoutRs>
  )
}

EditCalendarEntryPage.authenticate = true

export default EditCalendarEntryPage
