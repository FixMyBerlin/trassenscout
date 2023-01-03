import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { DateForm, FORM_ERROR } from "src/dates/components/DateForm"
import updateDate from "src/dates/mutations/updateDate"
import getDate from "src/dates/queries/getDate"

const EditDate = () => {
  const router = useRouter()
  const dateId = useParam("dateId", "number")
  const [date, { setQueryData }] = useQuery(
    getDate,
    { id: dateId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateDateMutation] = useMutation(updateDate)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateDateMutation({
        id: date.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowDatePage({ dateId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Edit Date {date.id}" />

      <div>
        <h1>Edit Date {date.id}</h1>
        <pre>{JSON.stringify(date, null, 2)}</pre>

        <DateForm
          submitText="Update Date"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateDate}
          initialValues={date}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  )
}

const EditDatePage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditDate />
      </Suspense>

      <p>
        <Link href={Routes.DatesPage()}>Dates</Link>
      </p>
    </LayoutArticle>
  )
}

EditDatePage.authenticate = true

export default EditDatePage
