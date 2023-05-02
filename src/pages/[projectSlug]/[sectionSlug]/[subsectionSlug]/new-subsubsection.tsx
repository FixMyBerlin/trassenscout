import { Routes, useParam } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import createSubsubsection from "src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionForm, FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"
import { Suspense } from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { quote } from "src/core/components/text"
import getSubsectionBySlugs from "src/subsections/queries/getSubsectionBySlugs"
import { SubsubsectionSchema } from "src/subsubsections/schema"

const NewSubsubsection = () => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
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
      await router.push(Routes.ShowSubsubsectionPage({ subsubsectionId: subsubsection!.id }))
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
