import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import {
  CalendarEntryForm,
  FORM_ERROR,
} from "@/src/pagesComponents/calendar-entries/CalendarEntryForm"
import { getDate, getTime } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { transformValuesWithStartAt } from "@/src/pagesComponents/calendar-entries/utils/transformValuesWithStartAt"
import updateCalendarEntry from "@/src/server/calendar-entries/mutations/updateCalendarEntry"
import getCalendarEntry from "@/src/server/calendar-entries/queries/getCalendarEntry"
import {
  CalendarEntrySchema,
  CalendarEntryStartDateStartTimeSchema,
} from "@/src/server/calendar-entries/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const EditCalendarEntry = () => {
  const router = useRouter()
  const calendarEntryId = useParam("calendarEntryId", "number")
  const projectSlug = useProjectSlug()
  const [calendarEntry, { setQueryData }] = useQuery(
    getCalendarEntry,
    { projectSlug, id: calendarEntryId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateCalendarEntryMutation] = useMutation(updateCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const transformedValues = transformValuesWithStartAt(values)
      const updated = await updateCalendarEntryMutation({
        ...transformedValues,
        projectSlug,
        id: calendarEntry.id,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectSlug,
          calendarEntryId: updated.id,
        }),
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const Schema = CalendarEntrySchema.omit({ startAt: true }).merge(
    CalendarEntryStartDateStartTimeSchema,
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
      <CalendarEntryForm
        submitText="Speichern"
        schema={Schema}
        initialValues={createInitialValues()}
        onSubmit={handleSubmit}
      />

      <SuperAdminLogData data={calendarEntry} />
    </>
  )
}

const EditCalendarEntryPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Termin")} />
      <PageHeader title="Termin bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditCalendarEntry />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage({ projectSlug })}>Zurück zur Liste</Link>
      </p>
    </LayoutRs>
  )
}

EditCalendarEntryPage.authenticate = true

export default EditCalendarEntryPage
