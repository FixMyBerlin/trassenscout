import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { NetworkHierarchyForm } from "@/src/networkHierarchy/components/NetworkHierarchy"
import createNetworkHierarchy from "@/src/networkHierarchy/mutations/createNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/networkHierarchy/schema"
import { FORM_ERROR } from "@/src/subsubsections/components/SubsubsectionForm"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewNetworkHierarchyPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createNetworkHierarchyMutation] = useMutation(createNetworkHierarchy)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createNetworkHierarchyMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.NetworkHierarchysPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Ausbaustandard")} />
      <PageHeader title="Netzstufe hinzufügen" className="mt-12" />

      <NetworkHierarchyForm
        className="mt-10"
        submitText="Erstellen"
        schema={NetworkHierarchySchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewNetworkHierarchyPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewNetworkHierarchyPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewNetworkHierarchyPage.authenticate = true

export default NewNetworkHierarchyPage
