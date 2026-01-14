import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { proseClasses } from "@/src/core/components/text"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { EditableSurveyResponseListItemProps } from "../EditableSurveyResponseListItem"
import { EditSurveyResponseCommentForm } from "./EditSurveyResponseCommentForm"
import { localDateTime } from "./utils/localDateTime"
import { wasUpdated } from "./utils/wasUpdated"

type Props = {
  comment: EditableSurveyResponseListItemProps["response"]["surveyResponseComments"][number]
}

export const SurveyResponseCommentField = ({ comment }: Props) => {
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
          <EditSurveyResponseCommentForm comment={comment} />
        </IfUserCanEdit>
      </div>
    </div>
  )
}
