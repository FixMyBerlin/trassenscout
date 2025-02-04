import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsectionForm } from "@/src/pagesComponents/subsections/SubsectionForm"
import getProject from "@/src/server/projects/queries/getProject"
import createSubsection from "@/src/server/subsections/mutations/createSubsection"
import { SubsectionSchema } from "@/src/server/subsections/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const NewSubsectionSchema = SubsectionSchema.omit({ projectId: true })

const NewSubsection = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [createSubsectionMutation] = useMutation(createSubsection)

  type HandleSubmit = z.infer<typeof NewSubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation({
        ...values,
        slug: `pa${values.slug}`,
        projectId: project.id,
        projectSlug,
      })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug,
          subsectionSlug: subsection.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Planungsabschnitt")} />
      <PageHeader title="Planungsabschitt hinzufügen" className="mt-12" />

      <SubsectionForm
        isFeltFieldsReadOnly={Boolean(project?.felt_subsection_geometry_source_url)}
        initialValues={{ labelPos: "bottom" }}
        submitText="Erstellen"
        schema={NewSubsectionSchema}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsectionPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link href={Routes.ProjectDashboardPage({ projectSlug })}>Zurück Übersicht</Link>
      </p>
    </LayoutRs>
  )
}

NewSubsectionPage.authenticate = true

export default NewSubsectionPage
