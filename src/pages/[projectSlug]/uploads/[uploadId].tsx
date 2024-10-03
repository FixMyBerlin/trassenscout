import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import { UploadTable } from "@/src/pagesComponents/uploads/UploadTable"
import { splitReturnTo } from "@/src/pagesComponents/uploads/utils/splitReturnTo"
import deleteUpload from "@/src/server/uploads/mutations/deleteUpload"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const Upload = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const uploadId = useParam("uploadId", "number")
  const [upload] = useQuery(getUploadWithSubsections, { projectSlug, id: uploadId })
  const params: { returnPath?: string } = useRouterQuery()
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo(params)
  let backUrl = Routes.UploadsPage({ projectSlug })
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = Routes.SubsectionDashboardPage({
      projectSlug,
      subsectionSlug: subsectionSlug,
      subsubsectionSlug: subsubsectionSlug,
    })
  }

  const [deleteUploadMutation] = useMutation(deleteUpload)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${upload.id} unwiderruflich löschen?`)) {
      try {
        await deleteUploadMutation({ projectSlug, id: upload.id })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(backUrl)
    }
  }

  return (
    <>
      <PageHeader title="Dokument Details" className="mt-12" />

      <IfUserCanEdit>
        <ButtonWrapper className="mb-10 space-x-4">
          <Link button="blue" href={Routes.EditUploadPage({ projectSlug, uploadId: upload.id })}>
            Bearbeiten
          </Link>
          <button type="button" onClick={handleDelete} className={whiteButtonStyles}>
            Löschen
          </button>
          <Link href={Routes.UploadsPage({ projectSlug })}>Zurück zu Dokumenten</Link>
        </ButtonWrapper>
      </IfUserCanEdit>

      <UploadTable withAction={false} uploads={[upload]} />

      <SuperAdminLogData data={upload} />
    </>
  )
}

const ShowUploadPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokument Details" />

      <Suspense fallback={<Spinner page />}>
        <Upload />
      </Suspense>
    </LayoutRs>
  )
}

ShowUploadPage.authenticate = true

export default ShowUploadPage
