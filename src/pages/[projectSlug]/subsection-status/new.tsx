import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsectionStatusForm } from "@/src/pagesComponents/subsectionStatus/SubsectionStatusForm"
import createSubsectionStatus from "@/src/server/subsectionStatus/mutations/createSubsectionStatus"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewSubsectionStatusPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsectionStatusMutation] = useMutation(createSubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsectionStatusMutation({ ...values, projectSlug })
      await router.push(Routes.SubsectionStatussPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Status")} />
      <PageHeader title="Status hinzufügen" className="mt-12" />

      <SubsectionStatusForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsectionStatus.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsectionStatusPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsectionStatusPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsectionStatusPage.authenticate = true

export default NewSubsectionStatusPage
