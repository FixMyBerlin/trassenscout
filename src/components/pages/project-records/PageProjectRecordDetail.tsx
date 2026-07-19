import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { ProjectRecordDeleteActionBar } from "@/src/components/project-records/ProjectRecordDeleteActionBar"
import { ProjectRecordDetailClient } from "@/src/components/project-records/ProjectRecordDetailClient"
import { ProjectRecordNeedsReviewBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/project-records/$projectRecordId/")

export function PageProjectRecordDetail() {
  const { projectRecordId } = routeApi.useParams()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const router = useRouter()
  const canEdit = useUserCan().edit
  const id = Number(projectRecordId)
  const { data: projectRecord } = useSuspenseQuery(projectRecordQueryOptions({ projectSlug, id }))

  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED
  const returnPath = router.buildLocation({
    to:
      projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
        ? "/$projectSlug/project-records/needreview"
        : "/$projectSlug/project-records",
    params: { projectSlug },
  }).href

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Projektprotokoll"
            sectionTo="/$projectSlug/project-records"
            current={projectRecord.title}
          />
        }
        action={
          <IfUserCanEdit>
            <Link
              icon="edit"
              to="/$projectSlug/project-records/$projectRecordId/edit"
              params={{ projectSlug, projectRecordId: String(id) }}
              resetScroll={false}
            >
              Bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />
      {needsReview && (
        <ProjectRecordNeedsReviewBanner withAction projectSlug={projectSlug} projectRecordId={id} />
      )}
      <ProjectRecordDetailClient initialProjectRecord={projectRecord} />
      {canEdit && (
        <ActionBar
          className="mt-6"
          right={
            <ProjectRecordDeleteActionBar
              projectSlug={projectSlug}
              projectRecordId={projectRecord.id}
              projectRecordTitle={projectRecord.title}
              returnPath={returnPath}
              uploadsCount={projectRecord.uploads.length}
            />
          }
        />
      )}
      <BackLink
        to={returnPath}
        text={
          projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
            ? "Zurück zu den Protokolleinträgen zur Bestätigung"
            : "Zurück zu den Protokolleinträgen"
        }
      />
    </>
  )
}
