"use client"

import { Form, LabeledTextareaField } from "@/src/core/components/forms"
import { formatFormError } from "@/src/core/components/forms/formatFormError"
import { linkStyles } from "@/src/core/components/links"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import deleteSurveyResponseComment from "@/src/server/survey-response-comments/mutations/deleteSurveyResponseComment"
import updateSurveyResponseComment from "@/src/server/survey-response-comments/mutations/updateSurveyResponseComment"
import getFeedbackSurveyResponsesWithSurveyDataAndComments from "@/src/server/survey-responses/queries/getFeedbackSurveyResponsesWithSurveyDataAndComments"
import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { useState } from "react"
import { z } from "zod"
import { EditableSurveyResponseListItemProps } from "../EditableSurveyResponseListItem"

const commentSchema = z.object({
  body: z.string().min(1, "Pflichtfeld"),
})

type Props = {
  comment: EditableSurveyResponseListItemProps["response"]["surveyResponseComments"][number]
  commentLabel: string
}

export const EditSurveyResponseCommentForm = ({ comment, commentLabel }: Props) => {
  const projectSlug = useProjectSlug()
  const [updateSurveyResponseCommentMutation, { isLoading }] = useMutation(
    updateSurveyResponseComment,
  )
  const [deleteSurveyResponseCommentMutation] = useMutation(deleteSurveyResponseComment)
  const [open, setOpen] = useState(false)
  const session = useSession()

  const handleSubmit = async (values: z.infer<typeof commentSchema>) => {
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    try {
      await updateSurveyResponseCommentMutation({
        projectSlug: projectSlug!,
        commentId: comment.id,
        body: sanitize(values.body),
      })
      invalidateQuery(getFeedbackSurveyResponsesWithSurveyDataAndComments)
      setOpen(false)
    } catch (error: unknown) {
      return { success: false as const, message: formatFormError(error) }
    }
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
        <HeadingWithAction className="mb-2">
          <H3>{commentLabel} bearbeiten</H3>
          <ModalCloseButton onClose={() => setOpen(false)} />
        </HeadingWithAction>

        <Form
          schema={commentSchema}
          initialValues={{ body: comment.body ?? "" }}
          onSubmit={handleSubmit}
          submitText={`${commentLabel} speichern`}
          disabled={isLoading}
        >
          {(form) => (
            <LabeledTextareaField
              form={form}
              name="body"
              className="min-h-40"
              label=""
              data-1p-ignore
              data-lpignore
              required
            />
          )}
        </Form>

        <button
          type="button"
          title={`${commentLabel} löschen`}
          onClick={async () => {
            if (
              window.confirm(`Sind Sie sicher, dass Sie diesen ${commentLabel} löschen möchten?`)
            ) {
              try {
                setOpen(false)
                await deleteSurveyResponseCommentMutation({
                  projectSlug: projectSlug!,
                  commentId: comment.id,
                })
              } catch (error: unknown) {
                window.alert(String(error))
                console.error(error)
              }
            }
          }}
          className={clsx("mt-4 flex w-full items-end justify-end gap-2", linkStyles)}
        >
          <p>{commentLabel} löschen</p>
          <TrashIcon className={clsx(linkStyles, "h-6 w-6")} />
        </button>
      </Modal>
    </>
  )
}
