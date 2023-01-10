import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import { Link } from "src/core/components/links"
import { CalendarEntrySchema } from "src/calendar-entries/schema"

const NewCalendarEntryPage = () => {
  const router = useRouter()
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const calendarEntry = await createCalendarEntryMutation(values)
      await router.push(Routes.ShowCalendarEntryPage({ calendarEntryId: calendarEntry.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <LayoutArticle>
      <MetaTags noindex title="Neuer Kalendereintrag" />
      <h1>Neuer Kalendereintrag</h1>

      <CalendarEntryForm
        submitText="Erstellen"
        schema={CalendarEntrySchema}
        // initialValues={{}}
        onSubmit={handleSubmit}
      />

      <p>
        <Link href={Routes.CalendarEntriesPage()}>Alle Kalendereinträge</Link>
      </p>
    </LayoutArticle>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
