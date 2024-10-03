import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { NetworkHierarchyForm } from "@/src/pagesComponents/networkHierarchy/NetworkHierarchy"
import createNetworkHierarchy from "@/src/server/networkHierarchy/mutations/createNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
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
      await createNetworkHierarchyMutation({ ...values, projectSlug })
      await router.push(Routes.NetworkHierarchysPage({ projectSlug }))
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
