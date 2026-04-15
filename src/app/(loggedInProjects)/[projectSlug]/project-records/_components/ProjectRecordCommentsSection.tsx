"use client"

import { CommentField } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/CommentField"
import { NewCommentForm } from "@/src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/comments/NewCommentForm"
import { useUserCan } from "@/src/app/_components/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import createProjectRecordComment from "@/src/server/project-record-comments/mutations/createProjectRecordComment"
import deleteProjectRecordComment from "@/src/server/project-record-comments/mutations/deleteProjectRecordComment"
import updateProjectRecordComment from "@/src/server/project-record-comments/mutations/updateProjectRecordComment"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"

type Props = {
  projectRecord: Pick<Awaited<ReturnType<typeof getProjectRecord>>, "id" | "projectRecordComments">
}

export const ProjectRecordCommentsSection = ({ projectRecord }: Props) => {
  const projectSlug = useProjectSlug()
  const session = useSession()
  const isEditorOrAdmin = useUserCan().edit || session.role === "ADMIN"
  const [createProjectRecordCommentMutation] = useMutation(createProjectRecordComment)
  const [updateProjectRecordCommentMutation] = useMutation(updateProjectRecordComment)
  const [deleteProjectRecordCommentMutation] = useMutation(deleteProjectRecordComment)

  const invalidateProjectRecordQueries = () => {
    invalidateQuery(getProjectRecord)
  }

  return (
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
  )
}
