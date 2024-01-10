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
import { SubsubsectionInfraForm } from "src/subsubsectionInfra/components/SubsubsectionInfraForm"
import createSubsubsectionInfra from "src/subsubsectionInfra/mutations/createSubsubsectionInfra"
import { SubsubsectionInfra } from "src/subsubsectionInfra/schema"
import { FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"

const NewSubsubsectionInfraPageWithQuery = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [createSubsubsectionInfraMutation] = useMutation(createSubsubsectionInfra)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionInfraMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.SubsubsectionInfrasPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Führungsform hinzufügen")} />
      <PageHeader title="Führungsform hinzufügen" className="mt-12" />

      <SubsubsectionInfraForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsubsectionInfra.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionInfraPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsectionInfraPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionInfraPage.authenticate = true

export default NewSubsubsectionInfraPage
