import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { proseClasses } from "@/src/core/components/text"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { EditCommentForm } from "./EditCommentForm"
import { localDateTime } from "./utils/localDateTime"
import { wasUpdated } from "./utils/wasUpdated"

type Props = {
  comment:
    | NonNullable<
        Awaited<
          ReturnType<typeof getFeedbackSurveyResponsesWithSurveyDataAndComments>
        >["feedbackSurveyResponses"][number]["surveyResponseComments"][number]
      >
    | NonNullable<Awaited<ReturnType<typeof getProjectRecord>>["projectRecordComments"][number]>
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
        markdown={dompurify.sanitize(comment.body)}
        className={clsx(
          proseClasses,
          "hover:prose-a:text-teal-700 hover:prose-a:decoration-teal-700 prose-sm prose-a:underline",
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
