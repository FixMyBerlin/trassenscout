import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsubsectionStatusForm } from "src/subsubsectionStatus/components/SubsubsectionStatusForm"
import createSubsubsectionStatus from "src/subsubsectionStatus/mutations/createSubsubsectionStatus"
import { SubsubsectionStatus } from "src/subsubsectionStatus/schema"
import { FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"

const NewSubsubsectionStatusPageWithQuery = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [createSubsubsectionStatusMutation] = useMutation(createSubsubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionStatusMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.SubsubsectionStatussPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Ausbaustandard")} />
      <PageHeader title="Ausbaustandard hinzufügen" className="mt-12" />

      <SubsubsectionStatusForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsubsectionStatus.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionStatusPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsectionStatusPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionStatusPage.authenticate = true

export default NewSubsubsectionStatusPage
