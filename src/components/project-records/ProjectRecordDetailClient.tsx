import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { ProjectRecordCommentsSection } from "@/src/components/project-records/ProjectRecordCommentsSection"
import { CreateEditReviewHistory } from "@/src/components/project-records/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/components/project-records/ProjectRecordSummary"
import { ReprocessProjectRecordButton } from "@/src/components/project-records/ReprocessProjectRecordButton"
import { ReprocessProjectRecordEditForm } from "@/src/components/project-records/ReprocessProjectRecordEditForm"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export type ReprocessedProjectRecord = {
  title?: string
  body?: string
  date: Date
  projectRecordTopics?: number[]
}

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
        <label className="mb-2 block text-sm font-medium text-gray-700">Dokumente ergänzen</label>
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

  const [aiSuggestions, setAiSuggestions] = useState<ReprocessedProjectRecord | null>(null)

  const handleAiSuggestions = (suggestions: ReprocessedProjectRecord) => {
    setAiSuggestions(suggestions)
  }

  const handleCancelAiSuggestions = () => {
    setAiSuggestions(null)
  }

  const projectRecordSummaryProps = {
    projectRecord,
  }

  useEffect(() => {
    if (aiSuggestions) {
      const element = document.getElementById("ai-suggestions-form")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [aiSuggestions])

  return (
    <>
      {aiSuggestions ? (
        <SuperAdminBox>
          <div id="ai-suggestions-form" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-medium">Aktueller Protokolleintrag</h2>
              <ProjectRecordSummary {...projectRecordSummaryProps} />
              <ProjectRecordQuickUpload
                projectRecordId={projectRecord.id}
                onUploaded={refreshProjectRecord}
              />
            </div>

            <div>
              <IfUserCanEdit>
                <ReprocessProjectRecordEditForm
                  projectRecord={projectRecord}
                  aiSuggestions={aiSuggestions}
                  onCancel={handleCancelAiSuggestions}
                />
              </IfUserCanEdit>
            </div>
          </div>
        </SuperAdminBox>
      ) : (
        <>
          <SuperAdminBox>
            <IfUserCanEdit>
              <ReprocessProjectRecordButton
                projectRecordId={projectRecord.id}
                onAiSuggestions={handleAiSuggestions}
              />
            </IfUserCanEdit>
          </SuperAdminBox>

          <ProjectRecordSummary {...projectRecordSummaryProps} />
          <ProjectRecordQuickUpload
            projectRecordId={projectRecord.id}
            onUploaded={refreshProjectRecord}
          />
          <CreateEditReviewHistory projectRecord={projectRecord} />
        </>
      )}
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
    </>
  )
}
