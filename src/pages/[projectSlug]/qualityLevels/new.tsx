import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { QualityLevelForm } from "src/qualityLevels/components/QualityLevelForm"
import createQualityLevel from "src/qualityLevels/mutations/createQualityLevel"
import { QualityLevelSchema } from "src/qualityLevels/schema"
import { FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"

const NewQualityLevelPageWithQuery = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [createQualityLevelMutation] = useMutation(createQualityLevel)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createQualityLevelMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.QualityLevelsPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
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
