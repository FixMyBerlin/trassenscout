import { BlitzPage, Routes } from "@blitzjs/next"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, LayoutRs8, MetaTags } from "src/core/layouts"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import { Link } from "src/core/components/links"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { CalendarEntrySchema } from "src/calendar-entries/schema"

const NewCalendarEntry = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const calendarEntry = await createCalendarEntryMutation({ ...values, projectId: projectId! })
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectId: projectId!,
          calendarEntryId: calendarEntry.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuer Kalendereintrag" />
      <PageHeader title="Neuer Kalendereintrag" />

      <CalendarEntryForm
        submitText="Erstellen"
        schema={CalendarEntrySchema.omit({ projectId: true })}
        //  initialValues={{}}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewCalendarEntryPage: BlitzPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutRs8>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewCalendarEntry />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.CalendarEntriesPage({ projectId: projectId! })}>Zurück zur Liste</Link>
      </p>
    </LayoutRs8>
  )
}

NewCalendarEntryPage.authenticate = true

export default NewCalendarEntryPage
