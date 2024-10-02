import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { Link, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { useProjectSlug } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import { UploadTable } from "@/src/uploads/components/UploadTable"
import deleteUpload from "@/src/uploads/mutations/deleteUpload"
import getUploadWithSubsections from "@/src/uploads/queries/getUploadWithSubsections"
import { splitReturnTo } from "@/src/uploads/utils"
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
  let backUrl = Routes.UploadsPage({ projectSlug: projectSlug! })
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = Routes.SubsectionDashboardPage({
      projectSlug: projectSlug!,
      subsectionSlug: subsectionSlug,
      subsubsectionSlug: subsubsectionSlug,
    })
  }

  const [deleteUploadMutation] = useMutation(deleteUpload)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${upload.id} unwiderruflich löschen?`)) {
      await deleteUploadMutation({ projectSlug, id: upload.id })
      await router.push(backUrl)
    }
  }

  return (
    <>
      <PageHeader title="Dokument Details" className="mt-12" />

      <IfUserCanEdit>
        <ButtonWrapper className="mb-10 space-x-4">
          <Link
            button="blue"
            href={Routes.EditUploadPage({ projectSlug: projectSlug!, uploadId: upload.id })}
          >
            Bearbeiten
          </Link>
          <button type="button" onClick={handleDelete} className={whiteButtonStyles}>
            Löschen
          </button>
          <Link href={Routes.UploadsPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
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
