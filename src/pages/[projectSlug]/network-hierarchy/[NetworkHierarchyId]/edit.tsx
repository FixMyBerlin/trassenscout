import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoEditTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import updateNetworkHierarchy from "src/networkHierarchy/mutations/updateNetworkHierarchy"
import getNetworkHierarchy from "src/networkHierarchy/queries/getNetworkHierarchy"
import { NetworkHierarchySchema } from "src/networkHierarchy/schema"
import { FORM_ERROR, QualityLevelForm } from "src/qualityLevels/components/QualityLevelForm"

const EditQualityLevelWithQuery = () => {
  const router = useRouter()
  const networkHierarchyId = useParam("network-hierarchy", "number")
  const projectSlug = useParam("projectSlug", "string")

  const [networkHierarchy, { setQueryData }] = useQuery(
    getNetworkHierarchy,
    { id: networkHierarchyId },
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
        id: networkHierarchy.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.NetworkHierarchysPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <QualityLevelForm
        className="grow"
        submitText="Speichern"
        schema={NetworkHierarchySchema}
        initialValues={networkHierarchy}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.NetworkHierarchysPage({ projectSlug: projectSlug! })}>
          Zurück zur Übersicht
        </Link>
      </p>

      <SuperAdminLogData data={{ networkHierarchy }} />
    </>
  )
}

const EditQualityLevelPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Netzhierarchie")} />
      <PageHeader title="Netzhierarchie bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditQualityLevelWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditQualityLevelPage.authenticate = true

export default EditQualityLevelPage
