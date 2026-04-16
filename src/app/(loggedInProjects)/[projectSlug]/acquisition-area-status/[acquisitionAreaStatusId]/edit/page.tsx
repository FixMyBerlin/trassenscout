import { EditAcquisitionAreaStatusForm } from "@/src/app/(loggedInProjects)/[projectSlug]/acquisition-area-status/_components/EditAcquisitionAreaStatusForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import getAcquisitionAreaStatus from "@/src/server/acquisitionAreaStatuses/queries/getAcquisitionAreaStatus"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoEditTitle("Status"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; acquisitionAreaStatusId: string }
  searchParams: { from?: string }
}

export default async function EditAcquisitionAreaStatusPage({
  params: { projectSlug, acquisitionAreaStatusId },
  searchParams,
}: Props) {
  const acquisitionAreaStatus = await invoke(getAcquisitionAreaStatus, {
    projectSlug,
    id: Number(acquisitionAreaStatusId),
  })

  const fromParam = searchParams?.from

  return (
    <>
      <PageHeader title="Status bearbeiten" className="mt-12" />
      <EditAcquisitionAreaStatusForm
        acquisitionAreaStatus={acquisitionAreaStatus}
        projectSlug={projectSlug}
        fromParam={fromParam}
      />
    </>
  )
}
