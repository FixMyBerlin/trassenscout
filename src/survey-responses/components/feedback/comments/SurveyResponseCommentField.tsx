import dompurify from "dompurify"

import { Markdown } from "@/src/core/components/Markdown/Markdown"
import { proseClasses } from "@/src/core/components/text"
import { SurveyResponseComment } from "@prisma/client"
import clsx from "clsx"
import { EditSurveyResponseCommentForm } from "./EditSurveyResponseCommentForm"
import { localDateTime } from "./utils/localDateTime"
import { wasUpdated } from "./utils/wasUpdated"

type Props = {
  comment: SurveyResponseComment
}

export const SurveyResponseCommentField = ({ comment }: Props) => {
  const { author } = comment
  return (
    <>
      <Markdown
        markdown={dompurify.sanitize(comment.body)}
        className={clsx(
          proseClasses,
          "hover:prose-a:text-teal-700 hover:prose-a:decoration-teal-700 prose-sm border-l-4 border-white pl-3 prose-a:underline",
        )}
      />

      <div className="relative mt-3 flex items-center justify-between">
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

        <EditSurveyResponseCommentForm comment={comment} />
      </div>
    </>
  )
}
