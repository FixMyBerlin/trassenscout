import { Routes } from "@blitzjs/next"
import { useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import createSubsection from "src/subsections/mutations/createSubsection"
import { SubsectionForm, FORM_ERROR } from "src/subsections/components/SubsectionForm"
import { Link } from "src/core/components/links"
import { Suspense } from "react"
import { SubsectionSchema } from "src/subsections/schema"
import getUsers from "src/users/queries/getUsers"

const NewSubsection = () => {
  const router = useRouter()
  const projectId = useParam("projectId", "number")
  const sectionId = useParam("sectionId", "number")
  const [createSubsectionMutation] = useMutation(createSubsection)
  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation({ ...values, sectionId: sectionId! })
      await router.push(
        Routes.ShowSubsectionPage({
          projectId: projectId!,
          sectionId: sectionId!,
          subsectionId: subsection.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Subsection erstellen" />

      <h1>Neuen Subsection erstellen</h1>

      <SubsectionForm
        submitText="Erstellen"
        schema={SubsectionSchema.omit({ sectionId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const NewSubsectionPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <NewSubsection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectId: projectId! })}>Alle Abschnitte</Link>
      </p>
    </LayoutArticle>
  )
}

NewSubsectionPage.authenticate = true

export default NewSubsectionPage
