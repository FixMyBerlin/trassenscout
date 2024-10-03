import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { QualityLevelForm } from "@/src/pagesComponents/qualityLevels/QualityLevelForm"
import createQualityLevel from "@/src/server/qualityLevels/mutations/createQualityLevel"
import { QualityLevelSchema } from "@/src/server/qualityLevels/schema"
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
      await createQualityLevelMutation({ ...values, projectSlug })
      await router.push(Routes.QualityLevelsPage({ projectSlug }))
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
