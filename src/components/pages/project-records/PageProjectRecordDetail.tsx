import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectRecordDeleteActionBar } from "@/src/components/project-records/ProjectRecordDeleteActionBar"
import { ProjectRecordDetailClient } from "@/src/components/project-records/ProjectRecordDetailClient"
import { ProjectRecordEditingStateButton } from "@/src/components/project-records/ProjectRecordEditingStateButton"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useIsProjectLeadOrAdmin } from "@/src/components/shared/app/memberships/hooks/useIsProjectLeadOrAdmin"
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
  const canConfirm = useIsProjectLeadOrAdmin(projectRecord.project)
  const returnsToReview =
    canConfirm && projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW

  const returnPath = router.buildLocation({
    to: returnsToReview
      ? "/$projectSlug/project-records/needreview"
      : "/$projectSlug/project-records",
    params: { projectSlug },
  }).href

  return (
    <>
      <PageHeader
        title={projectRecord.title}
        titleAction={
          <ProjectRecordEditingStateButton key={projectRecord.id} projectRecord={projectRecord} />
        }
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Projektprotokoll"
            sectionTo="/$projectSlug/project-records"
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
              bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />
      <ProjectRecordDetailClient initialProjectRecord={projectRecord} />
      {canEdit && (
        <ActionBar
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
      <BackLinkSection>
        <BackLink
          to={returnPath}
          text={
            returnsToReview
              ? "Zurück zu den Protokolleinträgen zur Bestätigung"
              : "Zurück zu den Protokolleinträgen"
          }
        />
      </BackLinkSection>
    </>
  )
}
