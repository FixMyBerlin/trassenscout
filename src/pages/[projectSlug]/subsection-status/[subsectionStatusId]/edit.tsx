import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsectionStatusForm } from "@/src/pagesComponents/subsectionStatus/SubsectionStatusForm"
import updateSubsectionStatus from "@/src/server/subsectionStatus/mutations/updateSubsectionStatus"
import getSubsectionStatus from "@/src/server/subsectionStatus/queries/getSubsectionStatus"
import { SubsectionStatus } from "@/src/server/subsectionStatus/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsectionStatusWithQuery = () => {
  const router = useRouter()
  const subsectionStatusId = useParam("subsectionStatusId", "number")
  const projectSlug = useProjectSlug()

  const [subsectionStatus, { setQueryData }] = useQuery(
    getSubsectionStatus,
    { projectSlug, id: subsectionStatusId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsectionStatusMutation] = useMutation(updateSubsectionStatus)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionStatusMutation({
        id: subsectionStatus.id,
        projectSlug,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsectionStatussPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsectionStatusForm
        className="grow"
        submitText="Speichern"
        schema={SubsectionStatus}
        initialValues={subsectionStatus}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsectionStatussPage({ projectSlug })}>Zurück zur Übersicht</Link>
      </p>

      <SuperAdminLogData data={{ subsectionStatus }} />
    </>
  )
}

const EditSubsectionStatusPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Status")} />
      <PageHeader title="Status bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsectionStatusWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsectionStatusPage.authenticate = true

export default EditSubsectionStatusPage
