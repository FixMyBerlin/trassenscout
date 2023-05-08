import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import updateSubsubsection from "src/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"
import { SubsubsectionSchema } from "src/subsubsections/schema"

const EditSubsubsection = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    { slug: subsubsectionSlug! },
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
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionPath: [subsectionSlug!, subsubsection.slug],
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const title = `Teilplanung "${subsubsection.title}" bearbeiten`
  return (
    <>
      <MetaTags noindex title={title} />
      <PageHeader title={title} />

      <SubsubsectionForm
        submitText="Speichern"
        schema={SubsubsectionSchema}
        initialValues={subsubsection}
        onSubmit={handleSubmit}
      />

      <SuperAdminBox>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </SuperAdminBox>
    </>
  )
}

const EditSubsubsectionPage = () => {
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <p>
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionPath: [subsectionSlug!],
          })}
        >
          Zurück zum Abschnitt
        </Link>
      </p>
    </LayoutArticle>
  )
}

EditSubsubsectionPage.authenticate = true

export default EditSubsubsectionPage
