import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { subsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { SubsectionForm } from "@/src/pagesComponents/subsections/SubsectionForm"
import getProject from "@/src/server/projects/queries/getProject"
import deleteSubsection from "@/src/server/subsections/mutations/deleteSubsection"
import updateSubsection from "@/src/server/subsections/mutations/updateSubsection"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { SubsectionSchema } from "@/src/server/subsections/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsection = () => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [subsection, { setQueryData }] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })
  const [updateSubsectionMutation] = useMutation(updateSubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation({
        ...values,
        id: subsection.id,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug,
          subsectionSlug: updated.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)

  const showPath = subsectionDashboardRoute(projectSlug, subsection.slug)
  const indexPath = `/${projectSlug}` as Route

  return (
    <>
      <MetaTags noindex title={seoEditTitleSlug(subsection.slug)} />
      <PageHeader title={`${shortTitle(subsection.slug)} bearbeiten`} className="mt-12" />

      <SubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={{
          ...subsection,
        }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsection.slug)}
            onDelete={() => deleteSubsectionMutation({ projectSlug, id: subsection.id })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={showPath} text="Zurück zum Planungsabschnitt" />

      <SuperAdminLogData data={subsection} />
    </>
  )
}

const EditSubsectionPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsection />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsectionPage.authenticate = true

export default EditSubsectionPage
