import dompurify from "dompurify"
import { twJoin } from "tailwind-merge"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import type { RedactedCommentView } from "./commentTypes"
import { EditCommentForm } from "./EditCommentForm"
import { localDateTime } from "./utils/localDateTime"
import { wasUpdated } from "./utils/wasUpdated"

type Props = {
  comment: RedactedCommentView
  commentLabel: string
  mutateComment: {
    update: (body: string) => void
    remove: () => void
  }
}

export const CommentField = ({ comment, commentLabel, mutateComment }: Props) => {
  const { author } = comment
  const authorLabel = getFullnameWithInstitution(author) || "Nutzer*in"
  return (
    <div className="rounded-lg border border-gray-300 bg-blue-50 p-3 text-gray-700">
      <Markdown
        markdown={typeof window !== "undefined" ? dompurify.sanitize(comment.body) : comment.body}
        className={twJoin(
          proseClasses,
          "prose-sm prose-a:underline hover:prose-a:text-teal-700 hover:prose-a:decoration-teal-700",
        )}
      />
      <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-gray-300 pt-2">
        <div className="min-w-0">
          <strong>
            <span className="inline-block max-w-full truncate align-bottom" title={authorLabel}>
              {authorLabel}
            </span>
          </strong>
          {wasUpdated(comment) ? <br /> : ", "}
          {localDateTime(comment.createdAt)}
          {wasUpdated(comment) && <>, aktualisiert {localDateTime(comment.updatedAt)}</>}
        </div>
        <EditCommentForm
          comment={comment}
          commentLabel={commentLabel}
          mutateComment={mutateComment}
        />
      </div>
    </div>
  )
}
