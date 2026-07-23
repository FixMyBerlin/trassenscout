import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { ProjectRecordCommentsSection } from "@/src/components/project-records/ProjectRecordCommentsSection"
import { CreateEditReviewHistory } from "@/src/components/project-records/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordNeedsReviewBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { ProjectRecordSummary } from "@/src/components/project-records/ProjectRecordSummary"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  initialProjectRecord: ProjectRecord
  needsReviewEditHref?: string
}

const ProjectRecordQuickUpload = ({
  projectSlug,
  projectRecordId,
  onUploaded,
}: {
  projectSlug: string
  projectRecordId: number
  onUploaded: () => void
}) => {
  return (
    <IfUserCanEdit>
      <div className="mt-4">
        <label className="sr-only mb-2 block text-sm font-medium text-gray-700">
          Dokumente ergänzen
        </label>
        <UploadDropzoneContainer className="h-36 rounded-md p-0">
          <UploadDropzone
            projectSlug={projectSlug}
            fillContainer
            projectRecordIds={[projectRecordId]}
            onUploadComplete={async () => {
              onUploaded()
            }}
          />
        </UploadDropzoneContainer>
      </div>
    </IfUserCanEdit>
  )
}

export const ProjectRecordDetailClient = ({ initialProjectRecord, needsReviewEditHref }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const { data: projectRecord = initialProjectRecord } = useQuery({
    ...projectRecordQueryOptions({ projectSlug, id: initialProjectRecord.id }),
    initialData: initialProjectRecord,
  })
  const refreshProjectRecord = () => {
    void queryClient.invalidateQueries({
      queryKey: projectRecordQueryOptions({ projectSlug, id: initialProjectRecord.id }).queryKey,
    })
  }

  const uploadIds = projectRecord.uploads.map((upload) => upload.id)
  const { data: uploadsData } = useQuery({
    ...uploadsWithSubsectionsQueryOptions({
      projectSlug,
      where: { id: { in: uploadIds } },
    }),
    enabled: uploadIds.length > 0,
  })
  const projectRecordUploads = uploadsData?.uploads ?? []

  const needsReview = projectRecord.reviewState !== ProjectRecordReviewState.APPROVED

  const projectRecordUploadsSection = (
    <>
      <UploadTable
        projectSlug={projectSlug}
        withAction={false}
        withRelations={false}
        uploads={projectRecordUploads}
        onDelete={async () => {
          refreshProjectRecord()
        }}
      />
      <ProjectRecordQuickUpload
        projectSlug={projectSlug}
        projectRecordId={projectRecord.id}
        onUploaded={refreshProjectRecord}
      />
    </>
  )

  return (
    <>
      {needsReview && (
        <ProjectRecordNeedsReviewBanner
          withAction
          editHref={needsReviewEditHref}
          projectSlug={projectSlug}
          projectRecordId={projectRecord.id}
        />
      )}
      <div className={pageContentPaddingClassName}>
        <ProjectRecordSummary projectRecord={projectRecord} />
        {projectRecordUploadsSection}
      </div>
      <CreateEditReviewHistory projectRecord={projectRecord} />
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
    </>
  )
}
