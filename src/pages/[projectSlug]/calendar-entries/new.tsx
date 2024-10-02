import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import {
  CalendarEntryForm,
  FORM_ERROR,
} from "@/src/pagesComponents/calendar-entries/CalendarEntryForm"
import { transformValuesWithStartAt } from "@/src/pagesComponents/calendar-entries/utils/transformValuesWithStartAt"
import createCalendarEntry from "@/src/server/calendar-entries/mutations/createCalendarEntry"
import {
  CalendarEntrySchema,
  CalendarEntryStartDateStartTimeSchema,
} from "@/src/server/calendar-entries/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewCalendarEntry = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const transformedValues = transformValuesWithStartAt(values)
      const calendarEntry = await createCalendarEntryMutation({
        ...transformedValues,
        projectSlug,
      })
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectSlug,
          calendarEntryId: calendarEntry.id,
        }),
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
          startAt: true,
        }).merge(CalendarEntryStartDateStartTimeSchema)}
        //  initialValues={{}}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewCalendarEntryPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Termin")} />
      <PageHeader title="Neuer Termin" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewCalendarEntry />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage({ projectSlug })}>Zurück zur Liste</Link>
      </p>
    </LayoutRs>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
