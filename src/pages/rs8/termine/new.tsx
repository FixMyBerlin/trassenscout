import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntrySchema } from "src/calendar-entries/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import getProjects from "src/projects/queries/getProjects"

const NewCalendarEntryPage: BlitzPage = () => {
  const router = useRouter()
  const [{ projects }] = useQuery(getProjects, {})
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    console.log("SUBMIT")
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
    <LayoutRs8>
      <MetaTags noindex title="Neuer Kalendereintrag" />
      <PageHeader title="Neuer Kalendereintrag" />
      <Suspense>
        <CalendarEntryForm
          projects={projects}
          submitText="Erstellen"
          schema={CalendarEntrySchema}
          // initialValues={{}}
          onSubmit={handleSubmit}
        />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage()}>Zurück zur Liste</Link>
      </p>
    </LayoutRs8>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
