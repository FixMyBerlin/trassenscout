"use client"

import { ProjectRecordCommentsSection } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCommentsSection"
import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordSummary"
import { ReprocessProjectRecordButton } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordButton"
import { ReprocessProjectRecordEditForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordEditForm"
import { UploadDropzone } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzone"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { useQuery } from "@blitzjs/rpc"
import { useEffect, useState } from "react"

export type ReprocessedProjectRecord = {
  title?: string
  body?: string
  date: Date
  subsectionId?: number
  projectRecordTopics?: number[]
}

type Props = {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}

const ProjectRecordQuickUpload = ({
  projectRecordId,
  onUploaded,
}: {
  projectRecordId: number
  onUploaded: () => Promise<void>
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
              await onUploaded()
            }}
          />
        </UploadDropzoneContainer>
      </div>
    </IfUserCanEdit>
  )
}

export const ProjectRecordDetailClient = ({ initialProjectRecord }: Props) => {
  const projectSlug = useProjectSlug()
  const [projectRecord, { refetch }] = useQuery(
    getProjectRecord,
    { projectSlug, id: initialProjectRecord.id },
    {
      initialData: initialProjectRecord,
    },
  )
  const [aiSuggestions, setAiSuggestions] = useState<ReprocessedProjectRecord | null>(null)

  const handleAiSuggestions = (suggestions: ReprocessedProjectRecord) => {
    setAiSuggestions(suggestions)
  }

  const handleCancelAiSuggestions = () => {
    setAiSuggestions(null)
  }

  // Scroll to AI form when suggestions are loaded
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
        // Split view: ProjectRecord view on left, AI suggestions form on right
        <SuperAdminBox>
          <div id="ai-suggestions-form" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-medium">Aktueller Protokolleintrag</h2>
              <ProjectRecordSummary projectRecord={projectRecord} />
              <ProjectRecordQuickUpload
                projectRecordId={projectRecord.id}
                onUploaded={async () => {
                  await refetch()
                }}
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
        // Normal view
        <>
          <SuperAdminBox>
            <IfUserCanEdit>
              <ReprocessProjectRecordButton
                projectRecordId={projectRecord.id}
                onAiSuggestions={handleAiSuggestions}
              />
            </IfUserCanEdit>
          </SuperAdminBox>

          <ProjectRecordSummary projectRecord={projectRecord} />
          <ProjectRecordQuickUpload
            projectRecordId={projectRecord.id}
            onUploaded={async () => {
              await refetch()
            }}
          />
          <CreateEditReviewHistory projectRecord={projectRecord} />
        </>
      )}
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
    </>
  )
}
