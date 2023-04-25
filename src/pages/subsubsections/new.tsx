import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createSubsubsection from "src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionForm, FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"
import { Link } from "src/core/components/links"
import { Suspense } from "react"

const NewSubsubsection = () => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsubsection = await createSubsubsectionMutation(values)
      await router.push(Routes.ShowSubsubsectionPage({ subsubsectionId: subsubsection.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Subsubsection erstellen" />

      <h1>Neuen Subsubsection erstellen</h1>

      <SubsubsectionForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        // schema={SubsubsectionSchema}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsection />
      </Suspense>

      <p>
        <Link href={Routes.SubsubsectionsPage()}>Alle Subsubsections</Link>
      </p>
    </LayoutArticle>
  )
}

NewSubsubsectionPage.authenticate = true

export default NewSubsubsectionPage
