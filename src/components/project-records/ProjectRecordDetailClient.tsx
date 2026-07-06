import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ProjectRecordCommentsSection } from "@/src/components/project-records/ProjectRecordCommentsSection"
import { CreateEditReviewHistory } from "@/src/components/project-records/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/components/project-records/ProjectRecordSummary"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { UploadTable } from "@/src/components/uploads/UploadTable"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import { uploadsWithSubsectionsQueryOptions } from "@/src/server/uploads/uploadsWithSubsectionsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  initialProjectRecord: ProjectRecord
}

const ProjectRecordQuickUpload = ({
  projectRecordId,
  onUploaded,
}: {
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

export const ProjectRecordDetailClient = ({ initialProjectRecord }: Props) => {
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

  const projectRecordUploadsSection = (
    <>
      <UploadTable
        withAction={false}
        withRelations={false}
        uploads={projectRecordUploads}
        onDelete={async () => {
          refreshProjectRecord()
        }}
      />
      <ProjectRecordQuickUpload
        projectRecordId={projectRecord.id}
        onUploaded={refreshProjectRecord}
      />
    </>
  )

  return (
    <>
      <ProjectRecordSummary projectRecord={projectRecord} />
      {projectRecordUploadsSection}
      <CreateEditReviewHistory projectRecord={projectRecord} />
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
    </>
  )
}
