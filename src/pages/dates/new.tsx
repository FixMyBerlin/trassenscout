import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createDate from "src/dates/mutations/createDate"
import { DateForm, FORM_ERROR } from "src/dates/components/DateForm"
import { Link } from "src/core/components/links"

const NewDatePage = () => {
  const router = useRouter()
  const [createDateMutation] = useMutation(createDate)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const date = await createDateMutation(values)
      await router.push(Routes.ShowDatePage({ dateId: date.id }))
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <LayoutArticle>
      <MetaTags noindex title="Create New Date" />
      <h1>Create New Date</h1>

      <DateForm
        submitText="Create Date"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateDate}
        // initialValues={{}}
        onSubmit={handleSubmit}
      />

      <p>
        <Link href={Routes.DatesPage()}>Dates</Link>
      </p>
    </LayoutArticle>
  )
}

NewDatePage.authenticate = true

export default NewDatePage
