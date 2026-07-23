import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { CommentField } from "@/src/components/surveys/[surveyId]/responses/comments/CommentField"
import { NewCommentForm } from "@/src/components/surveys/[surveyId]/responses/comments/NewCommentForm"
import {
  createProjectRecordCommentFn,
  deleteProjectRecordCommentFn,
  updateProjectRecordCommentFn,
} from "@/src/server/project-record-comments/projectRecordComments.functions"
import {
  projectRecordQueryOptions,
  projectRecordsNeedsReviewQueryOptions,
  projectRecordsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecord } from "@/src/server/projectRecords/types"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  projectRecord: Pick<ProjectRecord, "id" | "projectRecordComments">
}

export const ProjectRecordCommentsSection = ({ projectRecord }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const queryClient = useQueryClient()
  const userCanComment = useUserCan().view
  const createProjectRecordCommentMutation = useMutation({
    mutationFn: createProjectRecordCommentFn,
  })
  const updateProjectRecordCommentMutation = useMutation({
    mutationFn: updateProjectRecordCommentFn,
  })
  const deleteProjectRecordCommentMutation = useMutation({
    mutationFn: deleteProjectRecordCommentFn,
  })

  const invalidateProjectRecordQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: projectRecordQueryOptions({ projectSlug, id: projectRecord.id }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: projectRecordsNeedsReviewQueryOptions({ projectSlug }).queryKey,
      }),
    ])
  }

  const hasComments = projectRecord.projectRecordComments.length > 0

  return (
    <>
      {(hasComments || userCanComment) && (
        <div className={pageContentPaddingClassName}>
          <h4 className="mb-3 font-semibold">Kommentare</h4>
          <ul className="flex max-w-3xl flex-col gap-4">
            {projectRecord.projectRecordComments?.map((comment) => {
              return (
                <li key={comment.id}>
                  <CommentField
                    comment={comment}
                    commentLabel="Kommentar"
                    mutateComment={{
                      update: async (body) => {
                        await updateProjectRecordCommentMutation.mutateAsync({
                          data: {
                            projectSlug: projectSlug!,
                            id: comment.id,
                            body,
                          },
                        })
                        await invalidateProjectRecordQueries()
                      },
                      remove: async () => {
                        await deleteProjectRecordCommentMutation.mutateAsync({
                          data: {
                            projectSlug: projectSlug!,
                            id: comment.id,
                          },
                        })
                        await invalidateProjectRecordQueries()
                      },
                    }}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {userCanComment && (
        <NewCommentForm
          commentLabel="Kommentar"
          commentHelp="Hier können Sie einen Kommentar zum Protokolleintrag hinzufügen."
          createComment={async (body) => {
            await createProjectRecordCommentMutation.mutateAsync({
              data: {
                projectSlug: projectSlug!,
                projectRecordId: projectRecord.id,
                body,
              },
            })
            await invalidateProjectRecordQueries()
          }}
        />
      )}
    </>
  )
}
