import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, CalendarEntryForm } from "src/calendar-entries/components/CalendarEntryForm"
import updateCalendarEntry from "src/calendar-entries/mutations/updateCalendarEntry"
import getCalendarEntry from "src/calendar-entries/queries/getCalendarEntry"
import { PageHeader } from "src/core/components/PageHeader"
import { CalendarEntrySchema } from "src/calendar-entries/schema"
import { quote } from "src/core/components/text"

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
      const updated = await updateCalendarEntryMutation({
        id: calendarEntry.id,
        projectSlug: projectSlug!,
        ...values,
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

  return (
    <>
      <MetaTags noindex title={`Termin ${quote(calendarEntry.title)}`} />

      <PageHeader title={`Termin ${quote(calendarEntry.title)}`} />
      <SuperAdminBox>
        <pre>{JSON.stringify(calendarEntry, null, 2)}</pre>
      </SuperAdminBox>

      <CalendarEntryForm
        submitText="Speichern"
        //projects={projects}
        schema={CalendarEntrySchema}
        initialValues={calendarEntry}
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
      <Suspense fallback={<div>Daten werden geladen…</div>}>
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
