import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import { Link } from "src/core/components/links"

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
      <MetaTags noindex title="Create New CalendarEntry" />
      <h1>Create New CalendarEntry</h1>

      <CalendarEntryForm
        submitText="Create CalendarEntry"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateCalendarEntry}
        // initialValues={{}}
        onSubmit={handleSubmit}
      />

      <p>
        <Link href={Routes.CalendarEntriesPage()}>CalendarEntries</Link>
      </p>
    </LayoutArticle>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
