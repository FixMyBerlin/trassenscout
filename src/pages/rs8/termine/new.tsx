import { BlitzPage, Routes as PageRoutes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntrySchema } from "src/calendar-entries/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs8, MetaTags } from "src/core/layouts"

const NewCalendarEntryPage: BlitzPage = () => {
  const router = useRouter()
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const calendarEntry = await createCalendarEntryMutation(values)
      await router.push(PageRoutes.ShowCalendarEntryPage({ calendarEntryId: calendarEntry.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <LayoutRs8>
      <MetaTags noindex title="Neuer Kalendereintrag" />
      <PageHeader title="Neuer Kalendereintrag" />

      <CalendarEntryForm
        submitText="Erstellen"
        schema={CalendarEntrySchema}
        // initialValues={{}}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={PageRoutes.CalendarEntriesPage()}>Zurück zur Liste</Link>
      </p>
    </LayoutRs8>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
