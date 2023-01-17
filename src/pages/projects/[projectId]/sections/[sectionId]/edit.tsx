import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SectionForm } from "src/sections/components/SectionForm"
import updateSection from "src/sections/mutations/updateSection"
import getSection from "src/sections/queries/getSection"
import { SectionSchema } from "src/sections/schema"
import getUsers from "src/users/queries/getUsers"

const EditSection = () => {
  const router = useRouter()
  const sectionId = useParam("sectionId", "number")
  const projectId = useParam("projectId", "number")
  const [section, { setQueryData }] = useQuery(
    getSection,
    { id: sectionId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSectionMutation] = useMutation(updateSection)
  const [{ users }] = useQuery(getUsers, {})

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSectionMutation({
        id: section.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.ShowSectionPage({
          projectId: projectId!,
          sectionId: updated.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Section ${section.id} bearbeiten`} />

      <h1>Section {section.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </SuperAdminBox>

      <SectionForm
        submitText="Speichern"
        schema={SectionSchema}
        initialValues={section}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const EditSectionPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditSection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectId: projectId! })}>Alle Sections</Link>
      </p>
    </LayoutArticle>
  )
}

EditSectionPage.authenticate = true

export default EditSectionPage
