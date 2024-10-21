import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionStatusForm } from "@/src/pagesComponents/subsubsectionStatus/SubsubsectionStatusForm"
import updateSubsubsectionStatus from "@/src/server/subsubsectionStatus/mutations/updateSubsubsectionStatus"
import getSubsubsectionStatus from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatus"
import { SubsubsectionStatus } from "@/src/server/subsubsectionStatus/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsubsectionsStatusWithQuery = () => {
  const router = useRouter()
  const subsubsectionStatusId = useParam("subsubsectionStatusId", "number")
  const projectSlug = useProjectSlug()

  const [subsubsectionStatus, { setQueryData }] = useQuery(
    getSubsubsectionStatus,
    { projectSlug, id: subsubsectionStatusId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionStatusMutation] = useMutation(updateSubsubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionStatusMutation({
        id: subsubsectionStatus.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsubsectionStatussPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionStatus}
        initialValues={subsubsectionStatus}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsubsectionStatussPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ subsubsectionStatus }} />
    </>
  )
}

const EditSubsubsectionStatusPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Status")} />
      <PageHeader title="Status bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsubsectionsStatusWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsubsectionStatusPage.authenticate = true

export default EditSubsubsectionStatusPage
