"use client"

import { ProjectRecordAssignedToPill } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordAssignedToPill"
import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordSummary"
import { ReprocessProjectRecordButton } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordButton"
import { ReprocessProjectRecordEditForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordEditForm"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"

import { useEffect, useState } from "react"

export type ReprocessedProjectRecord = {
  title?: string
  body?: string
  date: Date
  subsectionId?: number
  projectRecordTopics?: number[]
}

type Props = {
  projectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}

export const ProjectRecordDetailClient = ({ projectRecord }: Props) => {
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

  const assignedToPill = projectRecord.assignedTo && (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <ProjectRecordAssignedToPill assignedTo={projectRecord.assignedTo} />
    </div>
  )

  return (
    <>
      {aiSuggestions ? (
        // Split view: ProjectRecord view on left, AI suggestions form on right
        <SuperAdminBox>
          <div id="ai-suggestions-form" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-medium">Aktueller Protokolleintrag</h2>
              {assignedToPill}
              <ProjectRecordSummary projectRecord={projectRecord} />
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

          {assignedToPill}
          <ProjectRecordSummary projectRecord={projectRecord} />
          <CreateEditReviewHistory projectRecord={projectRecord} />
        </>
      )}
    </>
  )
}
