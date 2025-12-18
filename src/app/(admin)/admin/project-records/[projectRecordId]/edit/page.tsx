import { AdminEditProjectRecordForm } from "@/src/app/(admin)/admin/project-records/[projectRecordId]/edit/_components/AdminEditProjectRecordForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { ProjectRecordReviewState } from "@prisma/client"

import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokolleintrag bearbeiten",
}

export default async function AdminEditProjectRecordPage({
  params,
}: {
  params: { projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecordAdmin, {
    id: projectRecordId,
  })

  const needsReview = projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
  const pageTitle = needsReview
    ? "Protokolleintrag bearbeiten und  bestätigen"
    : "Protokolleintrag bearbeiten"

  return (
    <>
      <PageHeader title={pageTitle} className="mt-12" />
      <AdminEditProjectRecordForm projectRecord={projectRecord} />
    </>
  )
}
