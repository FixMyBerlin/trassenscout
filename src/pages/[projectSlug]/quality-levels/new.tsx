import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { QualityLevelForm } from "@/src/qualityLevels/components/QualityLevelForm"
import createQualityLevel from "@/src/qualityLevels/mutations/createQualityLevel"
import { QualityLevelSchema } from "@/src/qualityLevels/schema"
import { FORM_ERROR } from "@/src/subsubsections/components/SubsubsectionForm"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewQualityLevelPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createQualityLevelMutation] = useMutation(createQualityLevel)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createQualityLevelMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.QualityLevelsPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Ausbaustandard")} />
      <PageHeader title="Ausbaustandard hinzufügen" className="mt-12" />

      <QualityLevelForm
        className="mt-10"
        submitText="Erstellen"
        schema={QualityLevelSchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewQualityLevelPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewQualityLevelPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewQualityLevelPage.authenticate = true

export default NewQualityLevelPage
