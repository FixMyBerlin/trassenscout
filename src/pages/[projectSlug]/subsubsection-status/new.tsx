import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { FORM_ERROR } from "@/src/pagesComponents/subsubsections/SubsubsectionForm"
import { SubsubsectionStatusForm } from "@/src/pagesComponents/subsubsectionStatus/SubsubsectionStatusForm"
import createSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/createSubsubsectionStatus"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewSubsubsectionStatusPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsubsectionStatusMutation] = useMutation(createSubsubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionStatusMutation({ ...values, projectSlug })
      await router.push(Routes.SubsubsectionStatussPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Status")} />
      <PageHeader title="Status hinzufügen" className="mt-12" />

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
