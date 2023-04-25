import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { Spinner } from "src/core/components/Spinner"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import updateSubsubsection from "src/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"

const EditSubsubsection = () => {
  const router = useRouter()
  const subsubsectionId = useParam("subsubsectionId", "number")
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    { id: subsubsectionId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSubsubsectionMutation] = useMutation(updateSubsubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation({
        id: subsubsection.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowSubsubsectionPage({ subsubsectionId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Subsubsection ${subsubsection.id} bearbeiten`} />

      <h1>Subsubsection {subsubsection.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </SuperAdminBox>

      <SubsubsectionForm
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/createSubsubsection.ts to `Subsubsection/schema.ts`
        //   - Name `SubsubsectionSchema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/updateSubsubsection.ts to
        //   `const UpdateSubsubsectionSchema = SubsubsectionSchema.merge(z.object({id: z.number(),}))`
        // schema={SubsubsectionSchema}
        initialValues={subsubsection}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditSubsubsectionPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <p>
        <Link href={Routes.SubsubsectionsPage()}>Alle Subsubsections</Link>
      </p>
    </LayoutArticle>
  )
}

EditSubsubsectionPage.authenticate = true

export default EditSubsubsectionPage
