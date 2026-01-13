import { ProjectRecordReviewState } from "@/db"
import { NeedsReviewBanner } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/EditProjectRecordForm"
import { ProjectRecordDetailClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailClient"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { projectRecordEditRoute } from "@/src/core/routes/projectRecordRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"

import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokolleintrag",
}

export default async function ProjectRecordDetail({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: projectRecordId,
  })
  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED

  return (
    <>
      <PageHeader
        title={projectRecord.title}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={projectRecordEditRoute(params.projectSlug, projectRecordId)}>
              Bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />
      {needsReview && <NeedsReviewBanner projectRecord={projectRecord} withAction />}

      <ProjectRecordDetailClient projectRecord={projectRecord} />

      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link
          href={
            projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
              ? `/${params.projectSlug}/project-records/needsreview`
              : `/${params.projectSlug}/project-records`
          }
        >
          ← Zurück zur Protokoll-Übersicht
        </Link>
      </div>
    </>
  )
}
