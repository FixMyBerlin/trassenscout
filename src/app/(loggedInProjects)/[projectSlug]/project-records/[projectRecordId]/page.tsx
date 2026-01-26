import { ProjectRecordReviewState } from "@/db"
import { ProjectRecordDetailClient } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordDetailClient"
import { ProjectRecordFooterWithDeleteAction } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordFooterWithDeleteAction"
import { ProjectRecordNeedsReviewBanner } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordNeedsReviewBanner"
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
      {needsReview && (
        <ProjectRecordNeedsReviewBanner
          withAction
          projectSlug={params.projectSlug}
          projectRecordId={projectRecordId}
        />
      )}

      <ProjectRecordDetailClient projectRecord={projectRecord} />

      <ProjectRecordFooterWithDeleteAction
        projectSlug={params.projectSlug}
        projectRecordId={projectRecord.id}
        backHref={
          projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
            ? (`/${params.projectSlug}/project-records/needreview` as const)
            : (`/${params.projectSlug}/project-records` as const)
        }
        backText={
          projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
            ? "Zurück zu den Protokolleinträgen zur Bestätigung"
            : "Zurück zu den Protokolleinträgen"
        }
      />
    </>
  )
}
