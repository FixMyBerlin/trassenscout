import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSubsectionBySlugs from "src/subsections/queries/getSubsectionBySlugs"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import createSubsubsection from "src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionSchema } from "src/subsubsections/schema"

const NewSubsubsection = () => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  console.log("xxx", projectSlug, sectionSlug, subsectionSlug)
  const [subsection] = useQuery(getSubsectionBySlugs, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
    slug: subsectionSlug!,
  })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    console.log("v", values)
    try {
      const subsubsection = await createSubsubsectionMutation({
        ...values,
        subsectionId: subsection!.id,
      })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionPath: [subsectionSlug!],
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neue Teilplanung erstellen" />

      <PageHeader
        title="Teilplanung erstellen"
        subtitle={`Für den Abschnitt ${quote(subsection!.title)}`}
      />

      <SubsubsectionForm
        submitText="Erstellen"
        schema={SubsubsectionSchema.omit({ subsectionId: true })}
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
