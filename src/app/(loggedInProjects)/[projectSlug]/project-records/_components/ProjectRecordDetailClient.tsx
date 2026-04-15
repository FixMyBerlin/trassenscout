"use client"

import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordCreateEditReviewHistory"
import { ProjectRecordSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ProjectRecordSummary"
import { ReprocessProjectRecordButton } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordButton"
import { ReprocessProjectRecordEditForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/ReprocessProjectRecordEditForm"
import { CommentField } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/CommentField"
import { NewCommentForm } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/NewCommentForm"
import { useUserCan } from "@/src/app/_components/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createProjectRecordComment from "@/src/server/project-record-comments/mutations/createProjectRecordComment"
import deleteProjectRecordComment from "@/src/server/project-record-comments/mutations/deleteProjectRecordComment"
import updateProjectRecordComment from "@/src/server/project-record-comments/mutations/updateProjectRecordComment"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
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
  const session = useSession()
  const isEditorOrAdmin = useUserCan().edit || session.role === "ADMIN"
  const [createProjectRecordCommentMutation] = useMutation(createProjectRecordComment)
  const [updateProjectRecordCommentMutation] = useMutation(updateProjectRecordComment)
  const [deleteProjectRecordCommentMutation] = useMutation(deleteProjectRecordComment)

  const invalidateProjectRecordQueries = () => {
    invalidateQuery(getProjectRecord)
  }

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
      <div>
        {(!!projectRecord.projectRecordComments.length || isEditorOrAdmin) && (
          <h4 className="mb-3 font-semibold">Kommentare</h4>
        )}
        <ul className="flex max-w-3xl flex-col gap-4">
          {projectRecord.projectRecordComments?.map((comment) => {
            return (
              <li key={comment.id}>
                <CommentField
                  comment={comment}
                  commentLabel="Kommentar"
                  mutateComment={{
                    update: (body) =>
                      updateProjectRecordCommentMutation(
                        {
                          projectSlug: projectSlug!,
                          commentId: comment.id,
                          body,
                        },
                        { onSuccess: invalidateProjectRecordQueries },
                      ),
                    remove: () =>
                      deleteProjectRecordCommentMutation(
                        {
                          projectSlug: projectSlug!,
                          commentId: comment.id,
                        },
                        { onSuccess: invalidateProjectRecordQueries },
                      ),
                  }}
                />
              </li>
            )
          })}
          <IfUserCanEdit>
            <li>
              <NewCommentForm
                commentLabel="Kommentar"
                commentHelp="Hier können Sie einen Kommentar zum Protokolleintrag hinzufügen."
                createComment={async (body) =>
                  createProjectRecordCommentMutation(
                    {
                      projectSlug: projectSlug!,
                      projectRecordId: projectRecord.id,
                      body,
                    },
                    { onSuccess: invalidateProjectRecordQueries },
                  )
                }
              />
            </li>
          </IfUserCanEdit>
        </ul>
      </div>
    </>
  )
}
