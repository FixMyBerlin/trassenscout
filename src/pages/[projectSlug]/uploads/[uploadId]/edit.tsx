import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import getSubsections from "@/src/subsections/queries/getSubsections"
import { FORM_ERROR, UploadForm } from "@/src/uploads/components/UploadForm"
import { UploadPreview } from "@/src/uploads/components/UploadPreview"
import updateUpload from "@/src/uploads/mutations/updateUploadWithSubsections"
import getUploadWithSubsections from "@/src/uploads/queries/getUploadWithSubsections"
import { UploadSchema } from "@/src/uploads/schema"
import { splitReturnTo } from "@/src/uploads/utils"
import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditUploadWithQuery = () => {
  const router = useRouter()
  const uploadId = useParam("uploadId", "number")
  const projectSlug = useParam("projectSlug", "string")

  const params: { returnPath?: string } = useRouterQuery()
  let backUrl = Routes.UploadsPage({ projectSlug: projectSlug! })
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo(params)
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = Routes.SubsectionDashboardPage({
      projectSlug: projectSlug!,
      subsectionSlug: subsectionSlug,
      subsubsectionSlug: subsubsectionSlug,
    })
  }

  const [upload, { setQueryData }] = useQuery(
    getUploadWithSubsections,
    { id: uploadId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateUploadMutation] = useMutation(updateUpload)

  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateUploadMutation({
        id: upload.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(backUrl)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const isSubsubsectionUpload = Boolean(upload.subsubsectionId)

  return (
    <>
      <div className="flex gap-10">
        <UploadPreview upload={upload} description={false} />
        <UploadForm
          className="grow"
          submitText="Speichern"
          schema={UploadSchema}
          initialValues={upload}
          onSubmit={handleSubmit}
          subsections={subsections}
          isSubsubsectionUpload={isSubsubsectionUpload}
        />
      </div>

      <p className="mt-5">
        <Link href={backUrl}>
          {isSubsubsectionUpload ? "Zurück zur Führung" : "Zurück zu Dokumenten"}
        </Link>
      </p>

      <SuperAdminLogData data={{ upload, subsections }} />
    </>
  )
}

const EditUploadPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Dokument")} />
      <PageHeader title="Dokument bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditUploadWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditUploadPage.authenticate = true

export default EditUploadPage
