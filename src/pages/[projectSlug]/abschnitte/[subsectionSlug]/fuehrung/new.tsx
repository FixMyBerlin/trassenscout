import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { getPrismaUniqueConstraintErrorMessage } from "src/core/components/forms/getPrismaUniqueConstraintErrorMessage"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { longTitle, seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSubsection from "src/subsections/queries/getSubsection"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import createSubsubsection from "src/subsubsections/mutations/createSubsubsection"
import { SubsubsectionSchemaForm } from "src/subsubsections/schema"
import { z } from "zod"

const NewSubsubsectionSchemaForm = SubsubsectionSchemaForm.omit({
  subsectionId: true,
})

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
    try {
      const subsubsection = await createSubsubsectionMutation({
        ...values,
        // The value="" becomes "0" which we translate to NULL
        managerId: values.managerId === 0 ? null : values.managerId,
        qualityLevelId: values.qualityLevelId === 0 ? null : values.qualityLevelId,
        subsectionId: subsection!.id,
      })
      await router.push(
        Routes.SubsubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: subsubsection.slug,
        }),
      )
    } catch (error: any) {
      return getPrismaUniqueConstraintErrorMessage(error, FORM_ERROR, ["slug"])
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
