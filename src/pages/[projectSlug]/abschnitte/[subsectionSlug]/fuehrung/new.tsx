import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { longTitle, seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSubsection from "src/subsections/queries/getSubsection"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import createSubsubsection from "src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionSchemaForm } from "src/subsubsections/schema"
import { z } from "zod"

const NewSubsubsectionSchemaForm = SubsubsectionSchemaForm.omit({ subsectionId: true })

const NewSubsubsection = () => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  const { projectSlug, subsectionSlug } = useSlugs()
  const [subsection] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })

  type HandleSubmit = z.infer<typeof NewSubsubsectionSchemaForm>
  const handleSubmit = async (values: HandleSubmit) => {
    console.log(values)
    try {
      const subsubsection = await createSubsubsectionMutation({
        ...values,
        // The value="" becomes "0" which we translate to NULL
        order: parseInt(values.order),
        managerId: values.managerId === 0 ? null : values.managerId,
        subsectionId: subsection!.id,
      })
      await router.push(
        Routes.SubsubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: subsubsection.id,
        }),
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
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
        initialValues={{ type: "AREA" }}
        className="mt-10"
        submitText="Erstellen"
        schema={NewSubsubsectionSchemaForm}
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
