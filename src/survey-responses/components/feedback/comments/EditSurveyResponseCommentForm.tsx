import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import dompurify from "dompurify"
import { useState } from "react"

import { Form, LabeledTextareaField } from "@/src/core/components/forms"
import { linkStyles } from "@/src/core/components/links"
import { Modal } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import updateSurveyResponseComment from "@/src/survey-response-comments/mutations/updateSurveyResponseComment"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useSession } from "@blitzjs/auth"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import deleteSurveyResponseComment from "../../../../survey-response-comments/mutations/deleteSurveyResponseComment"
import { EditableSurveyResponseListItemProps } from "../EditableSurveyResponseListItem"

type Props = {
  comment: EditableSurveyResponseListItemProps["response"]["surveyResponseComments"][number]
}

export const EditSurveyResponseCommentForm = ({ comment }: Props) => {
  const projectSlug = useProjectSlug()
  const [updateSurveyResponseCommentMutation, { isLoading, error }] = useMutation(
    updateSurveyResponseComment,
  )
  const [deleteSurveyResponseCommentMutation] = useMutation(deleteSurveyResponseComment)
  const [open, setOpen] = useState(false)
  const session = useSession()

  // todo any
  const handleSubmit = async (values: any) => {
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    updateSurveyResponseCommentMutation(
      {
        projectSlug: projectSlug!,
        commentId: comment.id,
        body: sanitize(values.body),
      },
      // todo tryout when the serach also includes the comment
      {
        onSuccess: () => {
          invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
          setOpen(false)
        },
      },
    )
  }

  const isAuthorOrAdmin = comment.author.id === session.userId || session.role === "ADMIN"
  if (!isAuthorOrAdmin) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx("flex items-center gap-2", linkStyles)}
      >
        <PencilIcon className="h-3.5 w-3.5 shrink-0" />
        <p>bearbeiten</p>
      </button>

      <Modal open={open} handleClose={() => setOpen(false)}>
        <H3 className="mb-2">Kommentar bearbeiten</H3>
        <Form onSubmit={handleSubmit} submitText="Kommentar speichern">
          <LabeledTextareaField
            name="body"
            className="min-h-40"
            label=""
            data-1p-ignore
            data-lpignore
            defaultValue={comment.body}
            required
          />
          {/* @ts-expect-errors TODO Research how the error message is provided by Blitz */}
          {error ? <p className="text-red-500">{error.message}</p> : null}
        </Form>
        <button
          type="button"
          title="Kommentar löschen"
          onClick={async () => {
            if (window.confirm("Sind Sie sicher, dass Sie diesen Kommentar löschen möchten?")) {
              try {
                setOpen(false)
                await deleteSurveyResponseCommentMutation({
                  projectSlug,
                  commentId: comment.id,
                })
              } catch (error: any) {
                window.alert(error.toString())
                console.error(error)
              }
            }
          }}
          className={clsx("mt-4 flex w-full items-end justify-end gap-2", linkStyles)}
        >
          <p>Kommentar löschen</p>
          <TrashIcon className={clsx(linkStyles, "h-6 w-6")} />
        </button>
      </Modal>
    </>
  )
}
