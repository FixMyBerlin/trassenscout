"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordCommentsSection } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCommentsSection"
import { ProjectRecordSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordSummary"
import { ReprocessProjectRecordButton } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordButton"
import { ReprocessProjectRecordEditForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordEditForm"
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

export const ProjectRecordDetailClient = ({ initialProjectRecord }: Props) => {
  const projectSlug = useProjectSlug()
  const [projectRecord] = useQuery(
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
          <CreateEditReviewHistory projectRecord={projectRecord} />
        </>
      )}
      <ProjectRecordCommentsSection projectRecord={projectRecord} />
    </>
  )
}
