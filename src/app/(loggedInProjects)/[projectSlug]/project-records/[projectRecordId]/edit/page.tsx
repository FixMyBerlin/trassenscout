import { EditProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/edit/_components/EditProjectRecordForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { ProjectRecordReviewState } from "@prisma/client"

import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll bearbeiten",
}

export default async function EditProjectRecordPage({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: projectRecordId,
  })

  const needsReview = projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
  const pageTitle = needsReview
    ? "Projektprotokoll bearbeiten und freigeben"
    : "Projektprotokoll bearbeiten"

  return (
    <>
      <PageHeader title={pageTitle} className="mt-12" />
      <EditProjectRecordForm projectRecord={projectRecord} />
    </>
  )
}
