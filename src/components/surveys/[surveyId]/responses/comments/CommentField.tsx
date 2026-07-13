import dompurify from "dompurify"
import { twJoin } from "tailwind-merge"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { ProjectRecord } from "@/src/server/projectRecords/types"
import type { FeedbackSurveyResponse } from "@/src/server/survey-responses/surveyResponsesQueryOptions"
import { EditCommentForm } from "./EditCommentForm"
import { localDateTime } from "./utils/localDateTime"
import { wasUpdated } from "./utils/wasUpdated"

type Props = {
  comment:
    | NonNullable<FeedbackSurveyResponse["surveyResponseComments"][number]>
    | NonNullable<ProjectRecord["projectRecordComments"][number]>
  commentLabel: string
  mutateComment: {
    update: (body: string) => void
    remove: () => void
  }
}

export const CommentField = ({ comment, commentLabel, mutateComment }: Props) => {
  const { author } = comment
  return (
    <div className="rounded-lg border border-gray-300 bg-blue-50 p-3 text-gray-700">
      <Markdown
        markdown={typeof window !== "undefined" ? dompurify.sanitize(comment.body) : comment.body}
        className={twJoin(
          proseClasses,
          "prose-sm prose-a:underline hover:prose-a:text-teal-700 hover:prose-a:decoration-teal-700",
        )}
      />
      <div className="relative mt-3 flex items-center justify-between border-t border-gray-300 pt-2">
        <div>
          <strong>
            <span className="inline-flex items-center gap-1">
              {author.firstName} {author.lastName}
            </span>
          </strong>
          {wasUpdated(comment) ? <br /> : ", "}
          {localDateTime(comment.createdAt)}
          {wasUpdated(comment) && <>, aktualisiert {localDateTime(comment.updatedAt)}</>}
        </div>
        <IfUserCanEdit>
          <EditCommentForm
            comment={comment}
            commentLabel={commentLabel}
            mutateComment={mutateComment}
          />
        </IfUserCanEdit>
      </div>
    </div>
  )
}
