import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoEditTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import {
  FORM_ERROR,
  SubsubsectionInfraForm,
} from "src/subsubsectionInfra/components/SubsubsectionInfraForm"
import updateSubsubsectionInfra from "src/subsubsectionInfra/mutations/updateSubsubsectionInfra"
import getSubsubsectionInfra from "src/subsubsectionInfra/queries/getSubsubsectionInfra"
import { SubsubsectionInfra } from "src/subsubsectionInfra/schema"

const EditSubsubsectionsInfraWithQuery = () => {
  const router = useRouter()
  const subsubsectionInfraId = useParam("subsubsectionInfraId", "number")
  const projectSlug = useParam("projectSlug", "string")

  const [subsubsectionInfra, { setQueryData }] = useQuery(
    getSubsubsectionInfra,
    { id: subsubsectionInfraId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionInfraMutation] = useMutation(updateSubsubsectionInfra)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionInfraMutation({
        id: subsubsectionInfra.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsubsectionInfrasPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfraForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfra}
        initialValues={subsubsectionInfra}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsubsectionInfrasPage({ projectSlug: projectSlug! })}>
          Zurück zur Übersicht
        </Link>
      </p>

      <SuperAdminLogData data={{ subsubsectionInfra }} />
    </>
  )
}

const EditSubsubsectionInfraPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Führungsform")} />
      <PageHeader title="Führungsform bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsubsectionsInfraWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsubsectionInfraPage.authenticate = true

export default EditSubsubsectionInfraPage
