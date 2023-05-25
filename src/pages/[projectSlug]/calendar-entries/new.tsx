import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import {
  CalendarEntrySchema,
  CalendarEntryStartDateStartTimeSchema,
} from "src/calendar-entries/schema"
import { transformValuesWithStartAt } from "src/calendar-entries/utils/transformValuesWithStartAt"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoNewTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"

const NewCalendarEntry = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const transformedValues = transformValuesWithStartAt(values)
      const calendarEntry = await createCalendarEntryMutation({
        ...transformedValues,
        projectSlug: projectSlug!,
      })
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectSlug: projectSlug!,
          calendarEntryId: calendarEntry.id,
        })
      )
    } catch (error: any) {
      console.error("handleSubmit", error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <CalendarEntryForm
        submitText="Erstellen"
        schema={CalendarEntrySchema.omit({
          projectSlug: true,
          startAt: true,
        }).merge(CalendarEntryStartDateStartTimeSchema)}
        //  initialValues={{}}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewCalendarEntryPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Termin")} />
      <PageHeader title="Neuer Termin" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewCalendarEntry />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage({ projectSlug: projectSlug! })}>
          Zurück zur Liste
        </Link>
      </p>
    </LayoutRs>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
