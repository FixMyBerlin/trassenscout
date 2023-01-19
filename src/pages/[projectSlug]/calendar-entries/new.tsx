import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { CalendarEntryForm, FORM_ERROR } from "src/calendar-entries/components/CalendarEntryForm"
import createCalendarEntry from "src/calendar-entries/mutations/createCalendarEntry"
import { CalendarEntrySchema } from "src/calendar-entries/schema"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProject from "src/projects/queries/getProject"

const NewCalendarEntry = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [createCalendarEntryMutation] = useMutation(createCalendarEntry)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const calendarEntry = await createCalendarEntryMutation({
        ...values,
        projectId: project.id!,
      })
      await router.push(
        Routes.ShowCalendarEntryPage({
          projectSlug: projectSlug!,
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
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
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
