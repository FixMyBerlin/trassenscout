import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { FORM_ERROR, OperatorForm } from "@/src/pagesComponents/operators/OperatorForm"
import updateOperator from "@/src/server/operators/mutations/updateOperator"
import getOperator from "@/src/server/operators/queries/getOperator"
import { OperatorSchema } from "@/src/server/operators/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditOperatorWithQuery = () => {
  const router = useRouter()
  const operatorId = useParam("operatorId", "number")
  const projectSlug = useProjectSlug()

  const [operator, { setQueryData }] = useQuery(
    getOperator,
    { projectSlug, id: operatorId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateOperatorMutation] = useMutation(updateOperator)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateOperatorMutation({
        id: operator.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.OperatorsPage({ projectSlug }))
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
        return improveErrorMessage(error, FORM_ERROR, ["slug"])
      }
    }
  }

  return (
    <>
      <OperatorForm
        className="grow"
        submitText="Speichern"
        schema={OperatorSchema}
        initialValues={operator}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.OperatorsPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ operator }} />
    </>
  )
}

const EditOperatorPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Baulastträger")} />
      <PageHeader title="Baulastträger bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditOperatorWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditOperatorPage.authenticate = true

export default EditOperatorPage
