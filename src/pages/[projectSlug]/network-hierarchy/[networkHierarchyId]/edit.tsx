import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { NetworkHierarchyForm } from "@/src/pagesComponents/networkHierarchy/NetworkHierarchy"
import updateNetworkHierarchy from "@/src/server/networkHierarchy/mutations/updateNetworkHierarchy"
import getNetworkHierarchy from "@/src/server/networkHierarchy/queries/getNetworkHierarchy"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditNetworkHierarchyWithQuery = () => {
  const router = useRouter()
  const networkHierarchyId = useParam("networkHierarchyId", "number")
  const projectSlug = useProjectSlug()

  const [networkHierarchy, { setQueryData }] = useQuery(
    getNetworkHierarchy,
    { projectSlug, id: networkHierarchyId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateNetworkHierarchyMutation] = useMutation(updateNetworkHierarchy)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateNetworkHierarchyMutation({
        ...values,
        id: networkHierarchy.id,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(Routes.NetworkHierarchysPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <NetworkHierarchyForm
        className="grow"
        submitText="Speichern"
        schema={NetworkHierarchySchema}
        initialValues={networkHierarchy}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.NetworkHierarchysPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ networkHierarchy }} />
    </>
  )
}

const EditNetworkHierarchyPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Netzhierarchie")} />
      <PageHeader title="Netzstufe bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditNetworkHierarchyWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditNetworkHierarchyPage.authenticate = true

export default EditNetworkHierarchyPage
