import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import updateSubsection from "src/subsections/mutations/updateSubsection"
import getSubsection from "src/subsections/queries/getSubsection"
import { SubsectionSchema } from "src/subsections/schema"
import getUsers from "src/users/queries/getUsers"

const EditSubsection = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const [subsection, { setQueryData }] = useQuery(
    getSubsection,
    { slug: subsectionSlug },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSubsectionMutation] = useMutation(updateSubsection)
  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation({
        id: subsection.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowSubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: updated.slug,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Abschnitt ${subsection.name} bearbeiten`} />

      <h1>Abschnitt {subsection.name} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(subsection, null, 2)}</pre>
      </SuperAdminBox>

      <SubsectionForm
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={subsection}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const EditSubsectionPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditSubsection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectSlug: projectSlug! })}>Alle Abschnitte</Link>
      </p>
    </LayoutArticle>
  )
}

EditSubsectionPage.authenticate = true

export default EditSubsectionPage
