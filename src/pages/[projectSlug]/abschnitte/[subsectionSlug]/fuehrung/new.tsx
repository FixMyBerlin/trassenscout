import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { longTitle, seoNewTitle } from "@/src/core/components/text"
import { useProjectSlug, useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import getSubsection from "@/src/subsections/queries/getSubsection"
import { FORM_ERROR, SubsubsectionForm } from "@/src/subsubsections/components/SubsubsectionForm"
import createSubsubsection from "@/src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionSchema } from "@/src/subsubsections/schema"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const NewSubsubsectionSchema = SubsubsectionSchema.omit({ subsectionId: true })

const NewSubsubsection = () => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  const { subsectionSlug } = useSlugs()
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  type HandleSubmit = z.infer<typeof NewSubsubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsubsection = await createSubsubsectionMutation({
        ...values,
        projectSlug,
        subsectionId: subsection!.id,
        trafficLoadDate: values.trafficLoadDate ? new Date(values.trafficLoadDate) : null,
        estimatedCompletionDate: values.estimatedCompletionDate
          ? new Date(values.estimatedCompletionDate)
          : null,
      })
      await router.push(
        Routes.SubsubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: subsubsection.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Führung")} />
      <PageHeader
        title="Führung hinzufügen"
        subtitle={longTitle(subsection.slug)}
        className="mt-12"
      />

      <SubsubsectionForm
        initialValues={{ type: "AREA", labelPos: "bottom" }}
        className="mt-10"
        submitText="Erstellen"
        schema={NewSubsubsectionSchema}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsection />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionPage.authenticate = true

export default NewSubsubsectionPage
