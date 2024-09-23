import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { OperatorForm } from "@/src/operators/components/OperatorForm"
import createOperator from "@/src/operators/mutations/createOperator"
import { OperatorSchema } from "@/src/operators/schema"
import { FORM_ERROR } from "@/src/subsubsections/components/SubsubsectionForm"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewOperatorPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createOperatorMutation] = useMutation(createOperator)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createOperatorMutation({ ...values, projectSlug })
      await router.push(Routes.OperatorsPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Baulastträger")} />
      <PageHeader title="Baulastträger hinzufügen" className="mt-12" />

      <OperatorForm
        className="mt-10"
        submitText="Erstellen"
        schema={OperatorSchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewOperatorPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewOperatorPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewOperatorPage.authenticate = true

export default NewOperatorPage
